"use client"

import dynamic from "next/dynamic"
import type { DashboardChartsProps } from "./DashboardCharts"

const DashboardCharts = dynamic(() => import("./DashboardCharts"), {
  ssr: false,
  loading: () => (
    <div className="grid gap-6">
      <div className="h-[300px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-[250px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
        <div className="h-[250px] animate-pulse rounded-2xl border border-slate-200 bg-slate-100/80" />
      </div>
    </div>
  ),
})

export default function DashboardChartsLazy(props: DashboardChartsProps) {
  return <DashboardCharts {...props} />
}
