import { getProductsForStock } from "@/actions/stock"
import StockTableEditor from "./StockTableEditor"

export const dynamic = "force-dynamic"

export default async function StockPage() {
  const productsStock = await getProductsForStock()

  return (
    <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
      <header className="pb-2 sm:pb-4">
        <h1 className="text-2xl font-extrabold text-[#1b3b50] tracking-tight sm:text-3xl">
          Control de Stock y Trazabilidad
        </h1>
        <p className="text-slate-500 font-medium mt-2 text-sm leading-relaxed sm:text-base">
          Tocá o hacé clic sobre cada cantidad para actualizar el stock físico en la base.
        </p>
      </header>
      
      <div>
        <StockTableEditor products={productsStock} />
      </div>
    </div>
  )
}
