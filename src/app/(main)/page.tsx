import prisma from "@/lib/prisma"
import Link from "next/link"
import {
  eachDayOfInterval,
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
} from "date-fns"
import { es } from "date-fns/locale"
import DashboardCharts from "@/components/charts/DashboardCharts"

/** Evita pre-render en build sin conexión a la base de datos. */
export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  /** Ventana del gráfico: 15 días calendario (hoy + 14 atrás), siempre 15 puntos en el eje X. */
  const chartEnd = startOfDay(new Date())
  const chartStart = subDays(chartEnd, 14)
  const chartDays = eachDayOfInterval({ start: chartStart, end: chartEnd })
  const chartDateKeys = chartDays.map((d) => format(d, "yyyy-MM-dd"))

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  weekStart.setHours(0, 0, 0, 0)
  const monthStart = startOfMonth(new Date())
  monthStart.setHours(0, 0, 0, 0)

  const [clientsCount, pendingOrders, recentSales, movements, todayTotal, weekTotal, monthTotal, recentOrderItems, recentOrdersWithClients, productsStock] = await Promise.all([
    prisma.client.count(),
    prisma.order.count({ where: { status: "PENDIENTE" } }),
    prisma.order.findMany({
      where: { status: "COMPLETADO" },
      orderBy: { completed_at: "desc" },
      take: 5,
      include: { client: true }
    }),
    prisma.stockMovement.findMany({
      take: 8,
      orderBy: { created_at: "desc" },
      include: { product: true }
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETADO",
        completed_at: { gte: todayStart },
      },
      _sum: { total_amount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETADO",
        completed_at: { gte: weekStart },
      },
      _sum: { total_amount: true },
    }),
    prisma.order.aggregate({
      where: {
        status: "COMPLETADO",
        completed_at: { gte: monthStart },
      },
      _sum: { total_amount: true },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          status: "COMPLETADO",
          completed_at: { gte: chartStart },
        },
      },
      include: {
        order: { select: { completed_at: true } },
        product: { select: { brand: true } }
      }
    }),
    prisma.order.findMany({
      where: { status: "COMPLETADO", completed_at: { gte: chartStart } },
      include: { client: { select: { client_type: true } } }
    }),
    prisma.product.findMany({
      orderBy: [{ brand: "asc" }, { weight: "asc" }]
    })
  ])

  const totalToday = todayTotal._sum.total_amount || 0
  const totalWeek = weekTotal._sum.total_amount || 0
  const totalMonth = monthTotal._sum.total_amount || 0

  // ---------- DATA PARSING FOR ECHARTS ----------
  
  // 1. Líneas: ingresos por marca por día (eje X = 15 días fijos; días sin ventas = 0)
  const brandsSet = new Set<string>()
  const lineRaw: Record<string, Record<string, number>> = {}
  for (const k of chartDateKeys) lineRaw[k] = {}

  recentOrderItems.forEach((item) => {
    const completed = item.order.completed_at
    if (!completed) return
    const dateStr = format(startOfDay(new Date(completed)), "yyyy-MM-dd")
    if (!(dateStr in lineRaw)) return
    const brand = item.product.brand
    brandsSet.add(brand)
    lineRaw[dateStr][brand] =
      (lineRaw[dateStr][brand] || 0) + Number(item.subtotal)
  })

  const brandsFromCatalog = [
    ...new Set(productsStock.map((p) => p.brand as string)),
  ].sort()
  const brands = [
    ...new Set([...brandsFromCatalog, ...Array.from(brandsSet)]),
  ].sort()

  const series = brands.map((brand) => ({
    name: brand,
    type: "line" as const,
    smooth: true,
    connectNulls: true,
    data: chartDateKeys.map((k) => lineRaw[k][brand] || 0),
  }))

  const xAxisData = chartDays.map((d) =>
    format(d, "dd MMM", { locale: es })
  )

  const lineChartData = { xAxisData, series, brands }

  // 2. Pie Chart: Revenue by Client Type
  const pieMap: Record<string, number> = {};
  recentOrdersWithClients.forEach(o => {
     const ctype = o.client.client_type;
     pieMap[ctype] = (pieMap[ctype] || 0) + Number(o.total_amount);
  });
  const pieChartData = { data: Object.entries(pieMap).map(([name, value]) => ({ name, value })) }

  // 3. Bar Chart: Physical Stock
  const stockChartData = {
    categories: productsStock.map(p => `${p.brand} ${p.weight}k`),
    fullData: productsStock.map(p => p.stock_full),
    emptyData: productsStock.map(p => p.stock_empty)
  }
  // ----------------------------------------------

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Patrón del Gas
          </p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
            Panel principal de operación
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Vista rápida de recaudación, pedidos pendientes, clientes activos, stock y últimas operaciones.
          </p>
        </div>
        <Link
          href="/sales/new"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_12px_40px_rgba(42,80,120,0.45)] transition-transform transition-colors hover:bg-brand-500 hover:shadow-[0_18px_50px_rgba(61,110,168,0.5)]"
        >
          + Registrar venta
        </Link>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-5 py-4">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recaudación de hoy
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              ${Number(totalToday).toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
              ARS
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-800/80">
            Total de ventas completadas desde las 00:00 hs.
          </p>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-5 py-4">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recaudación de la semana
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              ${Number(totalWeek).toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
              ARS
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-800/80">
            Ventas completadas desde el lunes ({format(weekStart, "dd MMM", { locale: es })}).
          </p>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-emerald-500/40 bg-emerald-500/5 px-5 py-4">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-emerald-500/10 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Recaudación del mes
          </p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              ${Number(totalMonth).toLocaleString()}
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-900">
              ARS
            </span>
          </div>
          <p className="mt-1 text-xs text-emerald-800/80">
            Ventas completadas desde el 1° de {format(monthStart, "MMMM", { locale: es })}.
          </p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="relative overflow-hidden rounded-2xl border border-brand-500/35 bg-brand-50/80 px-5 py-4">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-brand-200/40 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-800">
            Pedidos pendientes
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              {pendingOrders}
            </span>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-900">
              En cola
            </span>
          </div>
          <p className="mt-1 text-xs text-brand-800/85">
            Pedidos aún no completados. Priorizá estos clientes.
          </p>
        </article>

        <article className="relative overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-900/5 px-5 py-4">
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-slate-800/15 to-transparent" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-700">
            Cartera de clientes
          </p>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold text-slate-900 tabular-nums">
              {clientsCount}
            </span>
            <span className="rounded-full bg-slate-900 text-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.18em]">
              Activos
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-700/80">
            Clientes con registro en el sistema.
          </p>
        </article>
      </section>

      {/* DASHBOARD CHARTS */}
      <section>
        <DashboardCharts lineChart={lineChartData} pieChart={pieChartData} stockChart={stockChartData} />
      </section>

      {/* TABLES */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr),minmax(0,1fr)]">
        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-25">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              Últimos Movimientos
            </h2>
            <Link
              href="/stock"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 underline decoration-1 underline-offset-4 hover:text-slate-900"
            >
              Control de Stock
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Fecha / Hora</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Producto</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Operación</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Llenas (+/-)</th>
                  <th className="px-5 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">Vacías (+/-)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-50">
                {movements.map((mov: any) => (
                  <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap text-[12px] font-medium text-slate-500">
                      {format(new Date(mov.created_at), "dd MMM HH:mm", { locale: es })}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-xs font-semibold text-slate-800">
                      {mov.product.brand} {mov.product.weight}kg
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-[11px] text-slate-600">
                      {mov.movement_type.replace('_', ' ')}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md w-12 ${mov.quantity_full_change > 0 ? "bg-emerald-100 text-emerald-700" : mov.quantity_full_change < 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {mov.quantity_full_change > 0 ? `+${mov.quantity_full_change}` : mov.quantity_full_change}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 text-[11px] font-bold rounded-md w-12 ${mov.quantity_empty_change > 0 ? "bg-emerald-100 text-emerald-700" : mov.quantity_empty_change < 0 ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                        {mov.quantity_empty_change > 0 ? `+${mov.quantity_empty_change}` : mov.quantity_empty_change}
                      </span>
                    </td>
                  </tr>
                ))}
                {movements.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-xs text-slate-500">
                      No hay movimientos registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-25">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
              Últimas operaciones
            </h2>
            <Link
              href="/sales"
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-700 underline decoration-1 underline-offset-4 hover:text-slate-900"
            >
              Bitácora
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentSales.map((sale: any) => (
              <div
                key={sale.id}
                className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 font-mono text-[11px] font-semibold text-slate-500">
                    #{sale.id}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {sale.client.first_name} {sale.client.last_name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {format(
                        new Date(sale.completed_at || sale.created_at),
                        "dd MMM HH:mm",
                        { locale: es }
                      )}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    ${Number(sale.total_amount).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                    {sale.payment_method}
                  </p>
                </div>
              </div>
            ))}
            {recentSales.length === 0 && (
              <div className="flex flex-col items-center px-6 py-10 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
                  <span className="text-xl text-slate-300">⏱</span>
                </div>
                <p className="text-sm font-medium text-slate-600">
                  Aún no hay operaciones registradas.
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Las ventas completadas aparecerán aquí automáticamente.
                </p>
              </div>
            )}
          </div>
        </article>
      </section>
    </div>
  )
}

