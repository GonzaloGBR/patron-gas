import { getOrder } from "@/actions/sales"
import { notFound } from "next/navigation"
import CompleteOrderForm from "./CompleteOrderForm"

export default async function CompleteOrderPage({ params }: { params: { id: string } }) {
  const parsedParams = await params
  const order = await getOrder(Number(parsedParams.id))

  if (!order || order.status !== "PENDIENTE") {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Completar Pedido Pendiente</h1>
      <CompleteOrderForm order={order} />
    </div>
  )
}
