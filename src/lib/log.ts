/** Log estructurado en una línea (fácil de filtrar en panel de logs del hosting). */
export function logError(scope: string, err: unknown, extra?: Record<string, string>) {
  const message = err instanceof Error ? err.message : String(err)
  const stack = err instanceof Error ? err.stack : undefined
  console.error(
    JSON.stringify({
      level: "error",
      scope,
      time: new Date().toISOString(),
      message,
      stack,
      ...extra,
    })
  )
}
