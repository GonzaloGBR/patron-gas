import ClientForm from "@/components/ClientForm"
import { getClient } from "@/actions/clients"
import { notFound } from "next/navigation"

export default async function EditClientPage({ params }: { params: { id: string } }) {
  const parsedParams = await params // Next.js 15 requires awaiting dynamic params
  const client = await getClient(Number(parsedParams.id))
  
  if (!client) {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar Cliente</h1>
      <ClientForm initialData={client} />
    </div>
  )
}
