"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { createSale } from "@/actions/sales"

export default function SaleForm({ clients, products }: { clients: any[], products: any[] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [clientId, setClientId] = useState<string>("")
  const [status, setStatus] = useState<string>("COMPLETADO")
  const [paymentMethod, setPaymentMethod] = useState<string>("EFECTIVO")
  
  // State for items: { [productId]: quantity }
  const [items, setItems] = useState<Record<string, number>>({})
  // State for empties: { [productId]: returned_quantity }
  const [empties, setEmpties] = useState<Record<string, number>>({})

  const selectedClient = clients.find(c => c.id.toString() === clientId)

  const handleItemChange = (productId: string, qty: number) => {
    setItems(prev => {
      const copy = { ...prev }
      if (qty <= 0) delete copy[productId]
      else copy[productId] = qty
      return copy
    })
  }

  const handleEmptyChange = (productId: string, qty: number) => {
    setEmpties(prev => ({ ...prev, [productId]: Math.max(0, qty) }))
  }

  const cart = useMemo(() => {
    if (!selectedClient) return []
    const result = []
    
    for (const [pId, qty] of Object.entries(items)) {
      const product = products.find(p => p.id.toString() === pId)
      if (!product) continue

      const priceObj = product.prices.find((pr: any) => pr.client_type === selectedClient.client_type)
      const unitPrice = priceObj ? parseFloat(priceObj.price) : 0
      const subtotal = unitPrice * qty

      result.push({
        product_id: pId,
        brand: product.brand,
        weight: product.weight,
        quantity: qty,
        unit_price: unitPrice,
        subtotal
      })
    }
    return result
  }, [items, selectedClient, products])

  const totalAmount = cart.reduce((sum, item) => sum + item.subtotal, 0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clientId || cart.length === 0) return alert("Selecciona un cliente y al menos 1 producto.")
    
    setLoading(true)
    
    try {
      await createSale({
        client_id: clientId,
        status,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        items: cart,
        empty_returned: empties
      })
      router.push("/sales")
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Error al procesar la venta")
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
      
      {/* Header Parameters */}
      <div className="bg-slate-50 border-b border-slate-200 p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cliente Seleccionado</label>
          <select 
            value={clientId} 
            onChange={e => setClientId(e.target.value)} 
            required
            className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-bold transition-all outline-none shadow-sm"
          >
            <option value="">-- Buscar Cliente --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.first_name} {c.last_name} ({c.client_type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado del Pedido</label>
          <select 
            value={status} 
            onChange={e => setStatus(e.target.value)} 
            className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-50 focus:bg-white focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 text-slate-900 font-bold transition-all outline-none shadow-sm"
          >
            <option value="COMPLETADO">✓ Completado / Entregado</option>
            <option value="PENDIENTE">⏸ Pendiente (En Camino)</option>
            <option value="CANCELADO">✕ Cancelado</option>
          </select>
        </div>

        {status === "COMPLETADO" ? (
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Método de Cobro</label>
            <select 
              value={paymentMethod} 
              onChange={e => setPaymentMethod(e.target.value)} 
              className="block w-full rounded-lg border border-emerald-200 px-3 py-2.5 bg-emerald-50 focus:border-emerald-500 focus:ring focus:ring-emerald-200 text-emerald-900 font-bold uppercase transition-all shadow-sm outline-none"
            >
              <option value="EFECTIVO">💵 Efectivo</option>
              <option value="TRANSFERENCIA">🏦 Transferencia</option>
            </select>
          </div>
        ) : (
           <div className="opacity-50 grayscale pointer-events-none">
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Método de Cobro</label>
             <input disabled className="block w-full rounded-lg border border-slate-200 px-3 py-2.5 bg-slate-100 text-slate-400 shadow-sm" value="Pendiente..." />
           </div>
        )}
      </div>

      <div className="p-6">
        {selectedClient ? (
          <div>
            <h3 className="text-sm font-black text-[#1b3b50] uppercase tracking-widest border-b-2 border-slate-100 pb-3 mb-6">Panel de Productos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map(product => {
                const qty = items[product.id] || 0
                const returnedEmpty = empties[product.id] || 0
                const priceObj = product.prices.find((pr: any) => pr.client_type === selectedClient.client_type)
                const unitPrice = priceObj ? parseFloat(priceObj.price) : 0
                const isActive = qty > 0

                return (
                  <div key={product.id} className={`border rounded-xl transition-all duration-300 ${isActive ? 'border-[#1b3b50] bg-[#1b3b50]/5 shadow-md' : 'border-slate-200 bg-white shadow-sm hover:border-slate-300'} p-4 flex flex-col justify-between`}>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`font-black uppercase tracking-tight ${isActive ? 'text-[#1b3b50]' : 'text-slate-600'}`}>
                        {product.brand} {product.weight}kg
                      </span>
                      <span className="text-slate-800 font-bold bg-slate-100 px-2.5 py-1 rounded-full text-xs border border-slate-200 shadow-sm">${unitPrice.toLocaleString()} /u</span>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Venta Llenas */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Garrafas Llenas:</span>
                        <div className="flex items-center">
                           <button type="button" onClick={() => handleItemChange(product.id.toString(), qty - 1)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 rounded-l-lg transition-colors">-</button>
                           <input type="number" readOnly value={qty} className="w-12 h-8 text-center font-bold bg-white border-y border-slate-200 p-0 text-slate-800 focus:ring-0 outline-none" />
                           <button type="button" onClick={() => handleItemChange(product.id.toString(), qty + 1)} className="w-8 h-8 flex items-center justify-center bg-[#1b3b50] hover:bg-[#122838] text-white font-bold border border-[#1b3b50] rounded-r-lg transition-colors shadow-sm">+</button>
                        </div>
                      </div>
                      
                      {/* Vacías Entregadas */}
                      {isActive && status === "COMPLETADO" && (
                        <div className="flex items-center justify-between border-t border-slate-200/50 pt-3 relative">
                          <span className="text-xs font-bold text-[#ff6b00] uppercase tracking-wider">Vacías devueltas:</span>
                          <div className="flex items-center">
                             <button type="button" onClick={() => handleEmptyChange(product.id.toString(), returnedEmpty - 1)} className="w-8 h-8 flex items-center justify-center bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold border border-orange-200 rounded-l-lg transition-colors">-</button>
                             <input type="number" readOnly value={returnedEmpty} className="w-12 h-8 text-center font-bold text-orange-900 bg-white border-y border-orange-200 p-0 focus:ring-0 outline-none" />
                             <button type="button" disabled={returnedEmpty >= qty} onClick={() => handleEmptyChange(product.id.toString(), returnedEmpty + 1)} className="w-8 h-8 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold border border-orange-500 rounded-r-lg disabled:opacity-50 transition-colors shadow-sm">+</button>
                          </div>
                        </div>
                      )}
                      
                      {isActive && returnedEmpty < qty && status === "COMPLETADO" && (
                         <div className="bg-red-50 text-red-600 text-xs font-semibold p-2.5 rounded-lg text-center border border-red-100 shadow-sm">
                           ¡Falta entregar {qty - returnedEmpty} vacío(s)! Se anotará como deuda.
                         </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            
            <div className="mt-8 bg-gradient-to-r from-[#1b3b50] to-[#2a5a7a] p-6 text-white flex justify-between items-center rounded-2xl shadow-lg border border-[#1b3b50]/50">
              <span className="text-sm font-semibold tracking-wider text-slate-200">Total Operación</span>
              <span className="text-4xl font-extrabold tracking-tight">${totalAmount.toLocaleString()}</span>
            </div>

          </div>
        ) : (
          <div className="py-16 border-2 border-dashed border-slate-200 rounded-2xl text-center flex flex-col items-center bg-slate-50/50">
            <span className="text-5xl mb-4 opacity-30 text-[#1b3b50]">👤</span>
            <p className="text-slate-600 font-bold text-lg">Selecciona un cliente para iniciar</p>
            <p className="text-slate-400 text-sm mt-2 max-w-sm">Los precios cambiarán dinámicamente según la categoría del cliente (Domicilio, Mayorista, etc.)</p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 bg-slate-50 border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading || cart.length === 0}
          className="px-8 py-3 bg-[#1b3b50] text-white text-sm font-bold rounded-xl hover:bg-[#122838] disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
        >
          {loading ? "Procesando..." : (status === "COMPLETADO" ? "Registrar Venta" : "Guardar Pedido")}
        </button>
      </div>
    </form>
  )
}
