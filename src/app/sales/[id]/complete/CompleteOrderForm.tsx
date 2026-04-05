"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { completePendingOrder } from "@/actions/sales"
import { PaymentMethod } from "@prisma/client"

export default function CompleteOrderForm({ order }: { order: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO")
  const [empties, setEmpties] = useState<Record<string, string>>({})

  const handleEmptyChange = (productId: string, value: string) => {
    setEmpties(prev => ({ ...prev, [productId]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const formattedEmpties = Object.fromEntries(
      Object.entries(empties).map(([k, v]) => [k, parseInt(v, 10) || 0])
    )

    try {
      await completePendingOrder(order.id, paymentMethod, formattedEmpties)
      router.push("/sales")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error completando el pedido")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 max-w-2xl border border-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Completar Pedido #{order.id}</h2>
        <p className="text-gray-600">Cliente: <span className="font-semibold">{order.client.first_name} {order.client.last_name}</span></p>
        <p className="text-gray-600">Total a cobrar: <span className="font-bold text-green-700">${Number(order.total_amount).toLocaleString()}</span></p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Método de Pago Efectuado</label>
        <select 
          value={paymentMethod} 
          onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
          className="block w-full text-black rounded-md border border-gray-300 px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="font-medium text-gray-900 border-b pb-2">Envases Vacíos Entregados por el Cliente</h3>
        {order.items.map((item: any) => {
          const productStrId = item.product_id.toString()
          return (
            <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded border">
               <div>
                  <p className="font-medium">{item.product.brand} {item.product.weight}kg</p>
                  <p className="text-sm text-gray-500">Cantidad vendida: {item.quantity}</p>
               </div>
               <div className="flex items-center gap-2">
                 <label className="text-sm">Vacíos devueltos:</label>
                 <input 
                   type="number" 
                   min={0}
                   max={item.quantity}
                   className="w-20 text-black border rounded px-2 py-1 text-center"
                   value={empties[productStrId] ?? ""}
                   onChange={(e) => handleEmptyChange(productStrId, e.target.value)}
                 />
               </div>
            </div>
          )
        })}
        <p className="text-xs text-red-600">Recuerda: Si el cliente devuelve menos vacíos que las garrafas llenas que compró, el sistema automáticamente le generará una deuda (Préstamo).</p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? "Procesando..." : "Confirmar Entrega"}
        </button>
      </div>
    </form>
  )
}
