import { getCreateSaleData } from "@/actions/sales"
import SaleForm from "./SaleForm"

export const dynamic = "force-dynamic"

export default async function NewSalePage() {
  const { clients, products } = await getCreateSaleData()

  // Serialize Decimal to string
  const serializedProducts = products.map((p: any) => ({
    ...p,
    prices: p.prices.map((pr: any) => ({
      ...pr,
      price: pr.price.toString()
    }))
  }))

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Nueva Venta / Pedido</h1>
      <SaleForm clients={clients} products={serializedProducts} />
    </div>
  )
}
