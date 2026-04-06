import { getClients } from "@/actions/clients"
import { ClientDirectoryTable } from "@/components/ClientDirectoryTable"
import Link from "next/link"

/** Evita pre-render en build (Hostinger/CI sin DATABASE_URL). */
export const dynamic = "force-dynamic"

export default async function ClientsPage() {
  const clients = await getClients()

  return (
    <div className="space-y-6">
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

      <ClientDirectoryTable clients={clients} />
    </div>
  )
}
