/** Tipos compartidos (importables desde Server Components sin arrastrar el bundle de ECharts). */
export type LineSeriesPoint = {
  name: string
  type: "line"
  smooth: boolean
  connectNulls: boolean
  data: number[]
}
