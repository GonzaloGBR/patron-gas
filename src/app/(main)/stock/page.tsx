import { getProductsForStock } from "@/actions/stock"
import StockTableEditor from "./StockTableEditor"

export const dynamic = "force-dynamic"

export default async function StockPage() {
  const productsStock = await getProductsForStock()

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <header className="pb-4">
        <h1 className="text-3xl font-extrabold text-[#1b3b50] tracking-tight">Control de Stock y Trazabilidad</h1>
        <p className="text-slate-500 font-medium mt-1">Has clic sobre cualquier número en la tabla para actualizar la cantidad físicamente depositada en la base.</p>
      </header>
      
      <div>
        <StockTableEditor products={productsStock} />
      </div>
    </div>
  )
}
