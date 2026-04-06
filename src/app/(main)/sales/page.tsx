import { getSales } from "@/actions/sales"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

export const dynamic = "force-dynamic"

export default async function SalesPage() {
  const sales = await getSales()

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Ventas y pedidos
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Historial de operaciones con clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Todas las ventas, pedidos pendientes y cancelaciones con detalle de método de cobro.
          </p>
        </div>
        <Link
          href="/sales/new"
          className="inline-flex items-center justify-center rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-[0_10px_35px_rgba(42,80,120,0.4)] hover:bg-brand-500"
        >
          + Nueva venta
        </Link>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Historial de operaciones
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  ID
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Fecha
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Cliente
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Estado
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Método
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Total
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y.divide-slate-100 bg-white">
              {sales.map((sale: any) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3 text-[11px] font-mono font-semibold text-slate-500">
                    #{sale.id}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-700">
                    {format(new Date(sale.created_at), "dd MMM yy", { locale: es })}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">
                    {sale.client.first_name} {sale.client.last_name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        sale.status === "COMPLETADO"
                          ? "bg-emerald-100 text-emerald-800"
                          : sale.status === "PENDIENTE"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.status === "COMPLETADO"
                        ? "Completado"
                        : sale.status === "PENDIENTE"
                        ? "Pendiente"
                        : "Cancelado"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {sale.payment_method || "-"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right font-mono text-sm font-semibold text-slate-900 tabular-nums">
                    ${Number(sale.total_amount).toLocaleString()}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sm">
                    {sale.status === "PENDIENTE" && (
                      <Link
                        href={`/sales/${sale.id}/complete`}
                        className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-700 underline decoration-1 underline-offset-4 hover:text-brand-600"
                      >
                        Completar
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-10 text-center.text-sm font-medium text-slate-400"
                  >
                    No hay ventas ni pedidos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
