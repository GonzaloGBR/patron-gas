/** Sin DB ni auth: sirve para comprobar que Node responde (diagnóstico 502/504). */
export const dynamic = "force-dynamic"

export async function GET() {
  return Response.json({
    ok: true,
    ts: Date.now(),
    node: process.version,
    /** Si el proxy apunta a otro puerto que el que escucha Node, verás 503. */
    port: process.env.PORT ?? null,
  })
}
