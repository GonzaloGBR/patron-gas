"use client"

import { useState } from "react"
import { updateProductPrices } from "@/actions/products"

type PriceItem = {
  id: number
  client_type: string
  price: string
}

type Product = {
  id: number
  brand: string
  weight: number
  prices: PriceItem[]
}

export default function ProductsClientPage({ initialProducts }: { initialProducts: Product[] }) {
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState<number | null>(null)

  const handlePriceChange = (productId: number, clientType: string, newPrice: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        const prices = [...p.prices]
        const priceIndex = prices.findIndex(pr => pr.client_type === clientType)
        if (priceIndex >= 0) {
          prices[priceIndex].price = newPrice
        } else {
          prices.push({ id: 0, client_type: clientType, price: newPrice })
        }
        return { ...p, prices }
      }
      return p
    }))
  }

  const handleSave = async (product: Product) => {
    setLoading(product.id)
    try {
      const pricesToUpdate = product.prices.map(p => ({
        client_type: p.client_type,
        price: parseFloat(p.price)
      }))
      await updateProductPrices(product.id, pricesToUpdate)
      alert("Precios actualizados")
    } catch (error) {
      console.error(error)
      alert("Error al actualizar precios")
    }
    setLoading(null)
  }

  return (
    <div>
      <header className="pb-5 mb-8">
        <h1 className="text-3xl font-extrabold text-[#1b3b50] tracking-tight">Catálogo y Tarifas</h1>
        <p className="text-slate-500 font-medium mt-1">Gestión de precios por variedad de envase y categoría de cliente.</p>
      </header>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {products.map(product => {
          const precioDomicilio = product.prices.find(p => p.client_type === "DOMICILIO")?.price ?? ""
          const precioComedor = product.prices.find(p => p.client_type === "ESTABLECIMIENTO")?.price ?? ""
          const precioMayorista = product.prices.find(p => p.client_type === "MAYORISTA")?.price ?? ""

          return (
            <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-md hover:shadow-lg transition-shadow flex flex-col overflow-hidden">
              <div className="bg-gradient-to-r from-[#1b3b50] to-[#2a5a7a] px-6 py-5">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  {product.brand} {product.weight}kg
                </h2>
              </div>
              
              <div className="p-6 flex-grow space-y-5 bg-slate-50/50">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Domicilio</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={precioDomicilio}
                      onChange={(e) => handlePriceChange(product.id, "DOMICILIO", e.target.value)}
                      className="w-28 pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-right text-slate-900 font-bold focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 transition-all bg-white shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Establecimiento</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={precioComedor}
                      onChange={(e) => handlePriceChange(product.id, "ESTABLECIMIENTO", e.target.value)}
                      className="w-28 pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-right text-slate-900 font-bold focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 transition-all bg-white shadow-sm"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Mayorista</span>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-400 font-bold">$</span>
                    <input 
                      type="number" 
                      value={precioMayorista}
                      onChange={(e) => handlePriceChange(product.id, "MAYORISTA", e.target.value)}
                      className="w-28 pl-7 pr-3 py-2 border border-slate-200 rounded-lg text-right text-slate-900 font-bold focus:border-[#1b3b50] focus:ring focus:ring-[#1b3b50]/20 transition-all bg-white shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-white border-t border-slate-100 mt-auto">
                <button
                  onClick={() => handleSave(product)}
                  disabled={loading === product.id}
                  className="w-full bg-[#1b3b50] hover:bg-[#122838] text-white font-bold py-3 px-4 rounded-xl transition-all disabled:opacity-50 shadow hover:shadow-md flex justify-center items-center gap-2"
                >
                  {loading === product.id ? "Guardando..." : "Actualizar Tarifas"}
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {products.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500 font-medium mt-6">
          No hay envases configurados en la base de datos.
        </div>
      )}
    </div>
  )
}
