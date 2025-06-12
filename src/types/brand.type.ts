export interface Brand {
  id: number
  title: string
  image?: string | null
  createdAt: string // hoặc Date nếu bạn parse ngày về kiểu Date
  updatedAt: string // hoặc Date
}
