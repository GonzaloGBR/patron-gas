import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { revalidatePath } from "next/cache"
import {
  executeManualLoan,
  type ManualLoanInput,
} from "@/lib/manual-loan"
import { logError } from "@/lib/log"
import { checkRateLimit, loansManualRateLimitConfig } from "@/lib/rate-limit"

const secret =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined

function clientIp(req: NextRequest): string {
  const xf = req.headers.get("x-forwarded-for")
  if (xf) return xf.split(",")[0]?.trim() || "unknown"
  return req.headers.get("x-real-ip")?.trim() || "unknown"
}

/** POST JSON opcional (integraciones); el panel usa Server Action `registerManualLoanAction`. */
export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    const { max, windowMs } = loansManualRateLimitConfig()
    if (!checkRateLimit(`loans-manual:${ip}`, max, windowMs)) {
      return NextResponse.json(
        {
          ok: false as const,
          error: "Demasiadas solicitudes. Probá más tarde.",
        },
        { status: 429 }
      )
    }

    const token = await getToken({
      req,
      secret,
    })
    const loansSecret = process.env.LOANS_API_SECRET?.trim()
    const apiKey = req.headers.get("x-loans-api-key")?.trim()
    const authorized =
      Boolean(token?.sub) ||
      (Boolean(loansSecret) && apiKey === loansSecret)

    if (!authorized) {
      return NextResponse.json(
        { ok: false as const, error: "No autorizado." },
        { status: 401 }
      )
    }

    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { ok: false as const, error: "Cuerpo JSON inválido." },
        { status: 400 }
      )
    }

    const b = body as Partial<ManualLoanInput>
    const input: ManualLoanInput = {
      clientId: Number(b.clientId),
      productId: Number(b.productId),
      quantity: Number(b.quantity),
      description: typeof b.description === "string" ? b.description : "",
    }

    const result = await executeManualLoan(input)

    if (result.ok) {
      try {
        revalidatePath("/loans")
        revalidatePath("/stock")
      } catch (e) {
        logError("manual-loan.revalidatePath", e)
      }
    }

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    })
  } catch (e) {
    logError("POST /api/loans/manual", e)
    return NextResponse.json(
      {
        ok: false as const,
        error: "Error interno en la API de préstamos.",
      },
      { status: 500 }
    )
  }
}
