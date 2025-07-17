"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CropType {
  id: string
  name: string
  pricePerRai: number
}

export default function AdminCropTypesPage() {
  const [cropTypes, setCropTypes] = useState<CropType[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<CropType | null>(null)
  const [newCrop, setNewCrop] = useState({ name: "", pricePerRai: 0 })

  const fetchCropTypes = async () => {
    setLoading(true)
    const res = await fetch("/api/crop-types")
    const { data } = await res.json()
    setCropTypes(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCropTypes() }, [])

  const handleAdd = async () => {
    if (!newCrop.name || !newCrop.pricePerRai) return
    await fetch("/api/crop-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCrop),
    })
    setNewCrop({ name: "", pricePerRai: 0 })
    fetchCropTypes()
  }

  const handleEdit = (crop: CropType) => setEditing(crop)

  const handleUpdate = async () => {
    if (!editing) return
    await fetch("/api/crop-types", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    })
    setEditing(null)
    fetchCropTypes()
  }

  const handleDelete = async (id: string) => {
    await fetch("/api/crop-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    })
    fetchCropTypes()
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">จัดการชนิดพืช</h1>
      <div className="mb-6 flex gap-2 items-end">
        <Input placeholder="ชื่อพืช" value={newCrop.name} onChange={e => setNewCrop({ ...newCrop, name: e.target.value })} />
        <Input placeholder="ราคา/ไร่" type="number" value={newCrop.pricePerRai} onChange={e => setNewCrop({ ...newCrop, pricePerRai: Number(e.target.value) })} />
        <Button onClick={handleAdd}>เพิ่ม</Button>
      </div>
      {loading ? <div>กำลังโหลด...</div> : (
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ชื่อ</th>
              <th className="border px-2 py-1">ราคา/ไร่</th>
              <th className="border px-2 py-1">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {cropTypes.map(crop => (
              <tr key={crop.id}>
                <td className="border px-2 py-1">
                  {editing?.id === crop.id ? (
                    <Input value={editing.name ?? ""} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                  ) : crop.name}
                </td>
                <td className="border px-2 py-1">
                  {editing?.id === crop.id ? (
                    <Input type="number" value={editing.pricePerRai ?? 0} onChange={e => setEditing({ ...editing, pricePerRai: Number(e.target.value) })} />
                  ) : crop.pricePerRai}
                </td>
                <td className="border px-2 py-1">
                  {editing?.id === crop.id ? (
                    <Button size="sm" onClick={handleUpdate}>บันทึก</Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(crop)}>แก้ไข</Button>{" "}
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(crop.id)}>ลบ</Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
} 