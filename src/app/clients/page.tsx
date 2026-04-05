import { getClients, deleteClient } from "@/actions/clients"
import Link from "next/link"

/** Evita pre-render en build (Hostinger/CI sin DATABASE_URL). */
export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
            Gestión de clientes
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Directorio y categorías de clientes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Datos de contacto y tipo de cliente para aplicar tarifas y controlar préstamos.
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-50 shadow-sm hover:bg-black"
        >
          + Agregar cliente
        </Link>
      </header>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Listado general de clientes
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Nombre / Razón social
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Teléfono
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Dirección
                </th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Categoría
                </th>
                <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {clients.map((client: any) => (
                <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                  <td className="whitespace-nowrap px-5 py-3 text-sm font-semibold text-slate-900">
                    {client.first_name} {client.last_name}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
                    {client.phone || "-"}
                  </td>
                  <td className="max-w-[220px] truncate px-5 py-3 text-sm text-slate-600">
                    {client.address || "-"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-sm">
                    <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-50">
                      {client.client_type}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-right text-sm">
                    <Link
                      href={`/clients/${client.id}/edit`}
                      className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 underline decoration-1 underline-offset-4 hover:text-slate-900"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-10 text-center text-sm font-medium text-slate-400"
                  >
                    No hay clientes registrados en la base de datos.
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
