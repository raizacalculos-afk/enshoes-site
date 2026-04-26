import NewProductPageClient from "./new-product-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default function Page() {
  return <NewProductPageClient />
}