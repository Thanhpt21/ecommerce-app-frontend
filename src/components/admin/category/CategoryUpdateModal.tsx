'use client'

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { useEffect, useState } from 'react'
import { useUpdateCategory } from '@/hooks/category/useUpdateCategory'

interface CategoryUpdateModalProps {
  open: boolean
  onClose: () => void
  category: any
  refetch?: () => void
}

export const CategoryUpdateModal = ({
  open,
  onClose,
  category,
  refetch,
}: CategoryUpdateModalProps) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateCategory()

  useEffect(() => {
    if (category && open) {
      form.setFieldsValue({
        title: category.title,
        slug: category.slug,
      })

      setFileList(
        category.image
          ? [
              {
                uid: '-1',
                name: 'image.jpg',
                status: 'done',
                url: category.image,
              },
            ]
          : []
      )
    }
  }, [category, open, form])

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj
      await mutateAsync({
        id: category.id,
        data: values,
        file,
      })
      message.success('Cập nhật danh mục thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lỗi cập nhật danh mục')
    }
  }

  return (
    <Modal
      title="Cập nhật danh mục"
      visible={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên danh mục" name="title" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item
            label="Slug"
            name="slug"
            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
        >
            <Input />
        </Form.Item>
       

        <Form.Item label="Hình ảnh">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isPending}
            block
          >
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
