"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient, updateClient, deleteClient } from "@/actions/clients"
import { Client } from "@prisma/client"

interface Props {
  initialData?: Client
}

export default function ClientForm({ initialData }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    try {
      if (initialData) {
        formData.append("id", initialData.id.toString())
        const res = await updateClient(null, formData)
        if (res && !res.success) {
           alert("Hubo un error al actualizar el cliente.")
           setLoading(false)
           return
        }
      } else {
        await createClient(formData)
      }
      router.push("/clients")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error inesperado en el servidor.")
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (confirm("¿Seguro que deseas eliminar este cliente? Se ocultará de tus listas pero se conservará su historial de ventas.")) {
      setLoading(true)
      const res = await deleteClient(initialData!.id)
      if (res && !res.success) {
        alert("Ocurrió un error al intentar eliminar el cliente.")
        setLoading(false)
        return
      }
      router.push("/clients")
      router.refresh()
    }
  }

  return (
    <div className="max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-600">
          {initialData ? "Editar cliente" : "Nuevo cliente"}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="px-5 py-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Nombre
            </label>
            <input
              type="text"
              name="first_name"
              required
              defaultValue={initialData?.first_name}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Apellido
            </label>
            <input
              type="text"
              name="last_name"
              required
              defaultValue={initialData?.last_name}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold.uppercase tracking-[0.18em] text-slate-600">
              Teléfono
            </label>
            <input
              type="text"
              name="phone"
              defaultValue={initialData?.phone || ""}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:border-slate-900"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Tipo de cliente
            </label>
            <select
              name="client_type"
              required
              defaultValue={initialData?.client_type || "DOMICILIO"}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:border-slate-900"
            >
              <option value="DOMICILIO">Domicilio</option>
              <option value="ESTABLECIMIENTO">Establecimiento</option>
              <option value="MAYORISTA">Por Mayor</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
              Dirección
            </label>
            <input
              type="text"
              name="address"
              defaultValue={initialData?.address || ""}
              className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition-colors focus:bg-white focus:border-slate-900"
            />
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {initialData ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors w-full sm:w-auto text-center"
            >
              Eliminar cliente
            </button>
          ) : (
            <span className="hidden sm:block" />
          )}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-50 transition-colors w-full sm:w-auto"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#1b3b50] px-6 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-[#122838] disabled:opacity-60 transition-colors shadow-md w-full sm:w-auto"
            >
              {loading ? "Procesando..." : (initialData ? "Actualizar cliente" : "Guardar cliente")}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
