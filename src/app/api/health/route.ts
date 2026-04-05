/** Sin DB ni auth: sirve para comprobar que Node responde (diagnóstico 502/504). */
export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json({ ok: true, ts: Date.now() })
}
