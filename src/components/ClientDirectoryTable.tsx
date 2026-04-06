"use client"

import type { Client } from "@prisma/client"
import Link from "next/link"
import { useMemo, useState } from "react"

function matchesQuery(client: Client, raw: string) {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  const fullName = `${client.first_name} ${client.last_name}`.toLowerCase()
  const phone = (client.phone ?? "").toLowerCase()
  const address = (client.address ?? "").toLowerCase()
  const type = client.client_type.toLowerCase()
  return (
    fullName.includes(q) ||
    phone.includes(q) ||
    address.includes(q) ||
    type.includes(q)
  )
}

type Props = {
  clients: Client[]
}

export function ClientDirectoryTable({ clients }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(
    () => clients.filter((c) => matchesQuery(c, query)),
    [clients, query]
  )

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">
            Listado general de clientes
          </h2>
          {clients.length > 0 && (
            <p className="mt-1 text-[11px] text-slate-500">
              {query.trim()
                ? `${filtered.length} de ${clients.length} coinciden`
                : `${clients.length} cliente${clients.length === 1 ? "" : "s"}`}
            </p>
          )}
        </div>
        <label className="relative w-full shrink-0 sm:max-w-xs">
          <span className="sr-only">Buscar clientes</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar nombre, teléfono, dirección…"
            autoComplete="off"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm outline-none ring-slate-900/5 focus:border-slate-300 focus:ring-2 focus:ring-slate-900/10"
          />
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>
        </label>
      </div>

      <div className="md:hidden divide-y divide-slate-100">
        {filtered.map((client) => (
          <div key={client.id} className="space-y-3 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <p className="min-w-0 text-sm font-semibold text-slate-900">
                {client.first_name} {client.last_name}
              </p>
              <Link
                href={`/clients/${client.id}/edit`}
                className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 underline decoration-1 underline-offset-4 hover:text-slate-900"
              >
                Editar
              </Link>
            </div>
            <dl className="grid gap-2 text-sm text-slate-600">
              <div className="flex flex-wrap gap-x-2 gap-y-1">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Tel.</dt>
                <dd className="min-w-0 break-words">{client.phone || "—"}</dd>
              </div>
              <div className="flex flex-col gap-0.5">
                <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Dirección</dt>
                <dd className="break-words leading-snug">{client.address || "—"}</dd>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-50">
                  {client.client_type}
                </span>
              </div>
            </dl>
          </div>
        ))}
        {clients.length === 0 && (
          <p className="px-6 py-10 text-center text-sm font-medium text-slate-400">
            No hay clientes registrados en la base de datos.
          </p>
        )}
        {clients.length > 0 && filtered.length === 0 && (
          <p className="px-6 py-10 text-center text-sm font-medium text-slate-400">
            No hay clientes que coincidan con &ldquo;{query.trim()}&rdquo;.
          </p>
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
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
            {filtered.map((client) => (
              <tr
                key={client.id}
                className="transition-colors hover:bg-slate-50"
              >
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
            {clients.length > 0 && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-10 text-center text-sm font-medium text-slate-400"
                >
                  No hay clientes que coincidan con &ldquo;{query.trim()}&rdquo;.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
