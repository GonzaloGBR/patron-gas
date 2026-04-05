import { getProductsWithPrices } from "@/actions/products"
import ProductsClientPage from "./ProductsClientPage"

export default async function ProductsServerPage() {
  const products = await getProductsWithPrices()
  
  // Serialize complex objects like Decimal to strings/numbers for Client Components
  const serializedProducts = products.map((p: any) => ({
    id: p.id,
    brand: p.brand,
    weight: p.weight,
    prices: p.prices.map((pr: any) => ({
      id: pr.id,
      client_type: pr.client_type,
      price: pr.price.toString()
    }))
  }))

  return <ProductsClientPage initialProducts={serializedProducts} />
}
