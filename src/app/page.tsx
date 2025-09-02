'use client'

import AddressSelector from "@/components/common/AddressSelector"


export default function Page() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-red-500">Chào mừng!</h1>
      <p>Xin chào</p>
      <AddressSelector />
    </div>
  )
}