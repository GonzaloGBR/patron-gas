"use client"

import ReactECharts from 'echarts-for-react'

interface DashboardChartsProps {
  lineChart: {
    xAxisData: string[]
    series: any[]
    brands: string[]
  }
  pieChart: {
    data: { name: string; value: number }[]
  }
  stockChart: {
    categories: string[]
    fullData: number[]
    emptyData: number[]
  }
}

export default function DashboardCharts({ lineChart, pieChart, stockChart }: DashboardChartsProps) {
  
  // -- Opciones Gráfico 1: Ganancias por Marca en el tiempo (Líneas)
  const lineOptions = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { data: lineChart.brands, bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: lineChart.xAxisData,
      axisLabel: { color: '#64748b', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      axisLabel: { color: '#64748b', fontSize: 10, formatter: '${value}' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: lineChart.series.map(s => ({
      ...s,
      symbolSize: 8,
      areaStyle: { opacity: 0.1 }
    })),
    color: ['#1b3b50', '#ff7a1a', '#10b981', '#3b82f6', '#8b5cf6']
  }

  // -- Opciones Gráfico 2: Ganancias por Tipo de Cliente (Pie)
  const pieOptions = {
    tooltip: { trigger: 'item', formatter: '{b}: ${c} ({d}%)' },
    legend: { bottom: 0, icon: 'circle' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        labelLine: { show: false },
        data: pieChart.data
      }
    ],
    color: ['#10b981', '#1b3b50', '#ff7a1a', '#f59e0b']
  }

  // -- Opciones Gráfico 3: Estado físico de envases (Barras)
  const barOptions = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend: { bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: stockChart.categories,
      axisLabel: { color: '#64748b', fontSize: 10, rotate: 15 }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { type: 'dashed', color: '#f1f5f9' } }
    },
    series: [
      {
        name: 'Llenas',
        type: 'bar',
        data: stockChart.fullData,
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      },
      {
        name: 'Vacías',
        type: 'bar',
        data: stockChart.emptyData,
        itemStyle: { borderRadius: [4, 4, 0, 0] }
      }
    ],
    color: ['#10b981', '#cbd5e1']
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pt-5 px-5">
        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Flujo de Ganancias por Tipo de Garrafa</h3>
        <p className="text-xs text-slate-500 mb-6 border-b border-slate-100 pb-4">Evolución de los ingresos brutos (Subtotales facturados) en los últimos 15 días.</p>
        <div className="h-[300px] w-full">
          <ReactECharts option={lineOptions} style={{ height: '100%', width: '100%' }} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pt-5 px-5">
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Porción de Mercado (últ. 15 drías)</h3>
           <p className="text-xs text-slate-500 mb-2 border-b border-slate-100 pb-4">De dónde provienen tus ingresos según categoría de cliente.</p>
           <div className="h-[250px] w-full">
             <ReactECharts option={pieOptions} style={{ height: '100%', width: '100%' }} />
           </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pt-5 px-5">
           <h3 className="text-sm font-black text-slate-700 uppercase tracking-wider mb-2">Estado de Inventario Gral.</h3>
           <p className="text-xs text-slate-500 mb-2 border-b border-slate-100 pb-4">Comparativa de garrafas listas para venta vs. material a devolver.</p>
           <div className="h-[250px] w-full">
             <ReactECharts option={barOptions} style={{ height: '100%', width: '100%' }} />
           </div>
        </div>
      </div>
    </div>
  )
}
