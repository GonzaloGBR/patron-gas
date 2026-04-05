"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { registerManualLoanAction } from "@/actions/register-manual-loan"

type LoanSaveResult = { ok: true } | { ok: false; error: string }

export default function LoanForm({ clients, products }: { clients: any[], products: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Tras un `await`, React puede dejar `e.currentTarget` en null; guardamos el formulario.
    const form = e.currentTarget
    setLoading(true)
    setMessage(null)

    const fd = new FormData(form)
    const clientId = Number(fd.get("client_id"))
    const productId = Number(fd.get("product_id"))
    const quantity = Number(fd.get("quantity"))
    const description = String(fd.get("description") ?? "")

    try {
      const result = (await registerManualLoanAction({
        clientId,
        productId,
        quantity,
        description,
      })) as LoanSaveResult

      if (!result || typeof result.ok !== "boolean") {
        setMessage({
          type: "err",
          text: "Respuesta inválida del servidor.",
        })
        return
      }

      if (!result.ok) {
        setMessage({ type: "err", text: result.error })
        return
      }

      form.reset()
      setMessage({ type: "ok", text: "Deuda registrada correctamente." })
      try {
        router.refresh()
      } catch {
        /* algunos entornos fallan al refrescar; la deuda ya quedó guardada */
      }
    } catch (error) {
      console.error(error)
      setMessage({
        type: "err",
        text: "Falló el envío del formulario. Actualizá la página e intentá de nuevo.",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-1 pb-3 border-b border-slate-100">
        Registrar deuda de envases
      </h2>
      <p className="mb-5 text-sm text-slate-500">
        Indicá cuántos vacíos prestás: se suma la deuda del cliente y se descuenta el mismo número del
        stock vacío de ese producto (tiene que haber vacíos disponibles). Para cuando devuelva, usá
        &ldquo;Saldar&rdquo; en el listado.
      </p>

      {message && (
        <div
          role="alert"
          className={`mb-4 rounded-lg border px-3 py-2 text-sm ${
            message.type === "ok"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

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
          {loading ? "Registrando..." : "Registrar deuda"}
        </button>
      </div>
    </form>
  )
}
