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

  const inputFullClass = (p: Product) =>
    `block w-full min-w-0 text-center rounded-xl border-2 px-3 py-2.5 text-base font-bold outline-none transition-all touch-manipulation md:w-24 md:shrink-0 ${
      (parseInt(drafts[p.id].stock_full, 10) || 0) !== p.stock_full
        ? "border-orange-400 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        : "border-emerald-200 bg-emerald-50 text-emerald-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
    }`

  const inputEmptyClass = (p: Product) =>
    `block w-full min-w-0 text-center rounded-xl border-2 px-3 py-2.5 text-base font-bold outline-none transition-all touch-manipulation md:w-24 md:shrink-0 ${
      (parseInt(drafts[p.id].stock_empty, 10) || 0) !== p.stock_empty
        ? "border-orange-400 bg-orange-50 text-orange-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        : "border-slate-200 bg-slate-50 text-slate-700 focus:border-[#1b3b50] focus:ring-2 focus:ring-[#1b3b50]/20"
    }`

  return (
    <div className="bg-white shadow-md rounded-2xl border border-slate-100 overflow-hidden">
      <div className="bg-white px-4 py-4 border-b border-slate-100 flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center sm:px-6 sm:py-5">
        <h2 className="text-base font-bold text-slate-800 sm:text-lg">Modificación manual de existencias</h2>
        {hasChanges && (
          <span className="text-xs font-semibold text-orange-600 animate-pulse shrink-0">
            Hay cambios sin guardar...
          </span>
        )}
      </div>

      {/* Móvil: tarjetas apiladas, sin scroll horizontal */}
      <div className="md:hidden divide-y divide-slate-100">
        {products.map((p) => (
          <div key={p.id} className="px-4 py-4 space-y-4">
            <p className="text-sm font-bold text-slate-800">
              {p.brand} {p.weight}kg
            </p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Llenas (stock real)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={drafts[p.id].stock_full}
                  onChange={(e) => handleInputChange(p.id, "stock_full", e.target.value)}
                  className={inputFullClass(p)}
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Vacías (a devolver)
                </span>
                <input
                  type="number"
                  inputMode="numeric"
                  value={drafts[p.id].stock_empty}
                  onChange={(e) => handleInputChange(p.id, "stock_empty", e.target.value)}
                  className={inputEmptyClass(p)}
                />
              </label>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <p className="px-4 py-12 text-center text-slate-500">No hay envases registrados en la base de datos.</p>
        )}
      </div>

      {/* Escritorio: tabla */}
      <div className="hidden md:block">
        <table className="w-full table-fixed divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="w-[28%] px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider lg:px-6 lg:py-4">
                Envase
              </th>
              <th className="w-[36%] px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider lg:px-6 lg:py-4">
                Llenas (stock real)
              </th>
              <th className="w-[36%] px-2 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider lg:px-6 lg:py-4">
                Vacías (a devolver)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-50">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 py-4 text-sm font-semibold text-slate-800 break-words lg:px-6 lg:py-5">
                  {p.brand} {p.weight}kg
                </td>
                <td className="px-2 py-4 text-center lg:px-6 lg:py-5">
                  <div className="flex justify-center items-center">
                    <input
                      type="number"
                      value={drafts[p.id].stock_full}
                      onChange={(e) => handleInputChange(p.id, "stock_full", e.target.value)}
                      className={inputFullClass(p)}
                    />
                  </div>
                </td>
                <td className="px-2 py-4 text-center lg:px-6 lg:py-5">
                  <div className="flex justify-center items-center">
                    <input
                      type="number"
                      value={drafts[p.id].stock_empty}
                      onChange={(e) => handleInputChange(p.id, "stock_empty", e.target.value)}
                      className={inputEmptyClass(p)}
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

      <div className="border-t border-slate-100 bg-slate-50 p-4 flex justify-stretch sm:justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || loading}
          className={`w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-2.5 rounded-xl text-sm font-bold tracking-wider uppercase transition-all shadow-sm touch-manipulation ${
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
