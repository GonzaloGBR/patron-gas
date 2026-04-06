"use client"

import { useState } from "react"
import { Product } from "@prisma/client"
import { updateStockBatch, type StockBatchUpdate } from "@/actions/stock"

interface DraftState {
  stock_full: string
  stock_empty: string
}

export default function StockTableEditor({ products }: { products: Product[] }) {
  const [loading, setLoading] = useState(false)
  const [drafts, setDrafts] = useState<Record<number, DraftState>>(() => {
    const initialState: Record<number, DraftState> = {}
    products.forEach((p) => {
      initialState[p.id] = { stock_full: p.stock_full.toString(), stock_empty: p.stock_empty.toString() }
    })
    return initialState
  })

  // Has any value changed compared to the DB props?
  const hasChanges = products.some(
    (p) =>
      (parseInt(drafts[p.id].stock_full, 10) || 0) !== p.stock_full ||
      (parseInt(drafts[p.id].stock_empty, 10) || 0) !== p.stock_empty
  )

  const handleInputChange = (productId: number, field: keyof DraftState, value: string) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    
    // Build array of changes
    const updates = products
      .map((p) => {
        const d = drafts[p.id]
        const new_full = parseInt(d.stock_full, 10) || 0
        const new_empty = parseInt(d.stock_empty, 10) || 0
        
        if (new_full !== p.stock_full || new_empty !== p.stock_empty) {
          return {
            product_id: p.id,
            old_full: p.stock_full,
            old_empty: p.stock_empty,
            new_full,
            new_empty,
          }
        }
        return null
      })
      .filter((u): u is StockBatchUpdate => u !== null)

    if (updates.length > 0) {
      try {
        const res = await updateStockBatch(updates)
        if (res && !res.success) {
          alert("Ocurrió un error al guardar los cambios: " + res.error)
        }
      } catch (e) {
        console.error(e)
        alert("Error inesperado al guardar el stock")
      }
    }
    
    setLoading(false)
  }

  return (
    <div className="bg-white shadow-md rounded-2xl border border-slate-100 overflow-hidden relative pb-16">
      <div className="bg-white px-6 py-5 border-b border-slate-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-slate-800">Modificación manual de existencias</h2>
        {hasChanges && (
          <span className="text-xs font-semibold text-orange-600 animate-pulse">Hay cambios sin guardar...</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Envase</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Llenas (stock real)</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Vacías (a devolver)</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50 relative">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-5 whitespace-nowrap text-sm font-semibold text-slate-800">
                  {p.brand} {p.weight}kg
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center items-center">
                    <input
                      type="number"
                      value={drafts[p.id].stock_full}
                      onChange={(e) => handleInputChange(p.id, "stock_full", e.target.value)}
                      className={`block w-24 text-center rounded-xl border-2 px-3 py-2 text-base font-bold outline-none transition-all ${
                        (parseInt(drafts[p.id].stock_full, 10) || 0) !== p.stock_full 
                          ? "border-orange-400 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                          : "border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                      }`}
                    />
                  </div>
                </td>
                <td className="px-6 py-5 text-center">
                  <div className="flex justify-center items-center">
                    <input
                      type="number"
                      value={drafts[p.id].stock_empty}
                      onChange={(e) => handleInputChange(p.id, "stock_empty", e.target.value)}
                      className={`block w-24 text-center rounded-xl border-2 px-3 py-2 text-base font-bold outline-none transition-all ${
                        (parseInt(drafts[p.id].stock_empty, 10) || 0) !== p.stock_empty
                           ? "border-orange-400 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                           : "border-slate-200 bg-slate-50 text-slate-700 focus:border-[#1b3b50] focus:ring-2 focus:ring-[#1b3b50]/20"
                      }`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-slate-500">
                  No hay envases registrados en la base de datos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="absolute bottom-0 left-0 right-0 bg-slate-50 border-t border-slate-100 p-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className={`px-8 py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-sm ${
            !hasChanges
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-[#1b3b50] text-white hover:bg-[#122838] hover:shadow-md active:scale-[0.98]"
          }`}
        >
          {loading ? "Calculando diferencias..." : "Guardar Cambios Efectuados"}
        </button>
      </div>
    </div>
  )
}
