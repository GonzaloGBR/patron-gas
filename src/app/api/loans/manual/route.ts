import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { revalidatePath } from "next/cache"
import {
  executeManualLoan,
  type ManualLoanInput,
} from "@/lib/manual-loan"

const secret =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || undefined

/** POST JSON opcional (integraciones); el panel usa Server Action `registerManualLoanAction`. */
export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret,
    })
    if (!token?.sub) {
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
        console.error("manual loan revalidatePath", e)
      }
    }

    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
    })
  } catch (e) {
    console.error("POST /api/loans/manual", e)
    return NextResponse.json(
      {
        ok: false as const,
        error: "Error interno en la API de préstamos.",
      },
      { status: 500 }
    )
  }
}
