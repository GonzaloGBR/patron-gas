"use client"

import { useState } from "react"
import { processManualLoan } from "@/actions/loans"

export default function LoanForm({ clients, products }: { clients: any[], products: any[] }) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    try {
      await processManualLoan(formData)
      e.currentTarget.reset()
    } catch (error) {
      console.error(error)
      alert("Error al procesar el envase")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-5 pb-3 border-b border-slate-100">Registro Manual de Envase</h2>
      
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Cliente</label>
          <select name="client_id" required className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-medium transition-all outline-none">
            <option value="">-- Buscar Cliente --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Producto (Marca/Kg)</label>
          <select name="product_id" required className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-medium transition-all outline-none">
            <option value="">-- Seleccione Envase --</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.brand} {p.weight}kg</option>
            ))}
          </select>
        </div>

        <div>
           <label className="block text-sm font-semibold text-slate-600 mb-1.5">Operación</label>
          <div className="relative">
            <select name="action_type" required className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-medium transition-all outline-none appearance-none">
              <optgroup label="Entregar (Aumenta su deuda)">
                <option value="LEND">↳ Prestarle (Llevó lleno sin vacío)</option>
              </optgroup>
              <optgroup label="Recibir (Baja su deuda)">
                <option value="RECEIVE">↰ Recibir (Devolvió un vacío)</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Cantidad</label>
            <input type="number" name="quantity" defaultValue={1} min={1} required className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-center text-lg font-bold text-slate-900 focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 transition-all outline-none" />
          </div>
          <div className="col-span-1">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Observación</label>
            <input type="text" name="description" placeholder="Aclaración..." className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-medium transition-all outline-none" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#1b3b50] text-white font-bold py-3.5 px-4 rounded-xl hover:bg-[#122838] disabled:opacity-50 transition-all mt-4 shadow hover:shadow-md"
        >
          {loading ? "Registrando..." : "Registrar Movimiento"}
        </button>
      </div>
    </form>
  )
}
