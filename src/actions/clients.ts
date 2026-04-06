"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { ClientType } from "@prisma/client"

export async function getClients() {
  return await prisma.client.findMany({
    where: { is_active: true },
    orderBy: { created_at: "desc" }
  })
}

export async function getClient(id: number) {
  return await prisma.client.findUnique({ where: { id } })
}

export async function createClient(formData: FormData) {
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const client_type = formData.get("client_type") as ClientType

  await prisma.client.create({
    data: {
      first_name,
      last_name,
      phone: phone || null,
      address: address || null,
      client_type,
      is_active: true
    }
  })

  revalidatePath("/clients")
}

export type ClientUpdateFormState =
  | { success: true }
  | { success: false; error: string }
  | null
  | undefined

export async function updateClient(
  _prev: ClientUpdateFormState,
  formData: FormData
) {
  const id = Number(formData.get("id"))
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const phone = formData.get("phone") as string
  const address = formData.get("address") as string
  const client_type = formData.get("client_type") as ClientType

  try {
    await prisma.client.update({
      where: { id },
      data: {
        first_name,
        last_name,
        phone: phone || null,
        address: address || null,
        client_type
      }
    })
    revalidatePath("/clients")
    return { success: true }
  } catch {
    return { success: false, error: "Error updating client" }
  }
}

export async function deleteClient(id: number) {
  try {
    await prisma.client.update({
      where: { id },
      data: { is_active: false }
    })
    revalidatePath("/clients")
    return { success: true }
  } catch {
    return { success: false, error: "Error deleting client" }
  }
}
