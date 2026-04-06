import { withAuth } from "next-auth/middleware"
import type { NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import type { NextFetchEvent, NextRequest } from "next/server"

const NO_STORE =
  "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"

const protectedMiddleware = withAuth(
  function middleware() {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/acceso",
    },
  }
)

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const p = req.nextUrl.pathname
  /** Archivos en `public/brand/*` — si pasan por withAuth, sin cookie devuelven HTML de login y el logo se rompe. */
  if (p.startsWith("/brand/")) {
    return NextResponse.next()
  }
  if (p === "/acceso" || p === "/login") {
    const res = NextResponse.next()
    res.headers.set("Cache-Control", NO_STORE)
    return res
  }
  return protectedMiddleware(req as NextRequestWithAuth, event)
}

/**
 * Excluye `api/auth` y `api/health` (probes del proxy / hosting sin pasar por withAuth).
 * El resto de `/api/*` sigue protegido por sesión.
 */
export const config = {
  matcher: ["/((?!api/auth|api/health|_next/static|_next/image|favicon.ico).*)"],
}
