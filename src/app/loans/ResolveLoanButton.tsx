"use client"

import { useState } from "react"
import { resolveLoan } from "@/actions/loans"

interface Props {
  loanId: number
  quantity: number
}

export default function ResolveLoanButton({ loanId, quantity }: Props) {
  const [loading, setLoading] = useState(false)

  const handleResolve = async () => {
    const isDebt = quantity > 0
    const msg = isDebt 
      ? `¿Confirmar que el cliente ya devolvió ${quantity} vacío(s)?\n\nEsto devolverá automáticamente los vacíos al Stock y eliminará el registro de deuda.`
      : `¿Confirmar que ya le entregaste al cliente ${Math.abs(quantity)} vacío(s) a favor?\n\nEsto restará los vacíos de tu Stock y eliminará el registro.`

    if (confirm(msg)) {
      setLoading(true)
      try {
        await resolveLoan(loanId)
      } catch (error) {
        console.error(error)
        alert("Ocurrió un error al procesar.")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleResolve}
      disabled={loading}
      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl border transition-colors ${
        quantity > 0 
          ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
          : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
      }`}
    >
      {loading ? "..." : "Saldar"}
    </button>
  )
}
