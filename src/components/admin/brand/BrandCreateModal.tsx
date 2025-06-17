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
import { useCreateBrand } from '@/hooks/brand/useCreateBrand'


export const BrandCreateModal = ({ open, onClose, refetch }: any) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useCreateBrand()

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj
       // Create a FormData object to send both text data and the file
      const formData = new FormData();
      formData.append('title', values.title); // Append the title field
      if (file) {
        formData.append('file', file); // Append the file under the key 'file' as expected by FileInterceptor
      }

      await mutateAsync(formData)
      message.success('Tạo thương hiệu thành công')
      onClose()
      form.resetFields()
      setFileList([])
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo thương hiệu')
    }
  }

  useEffect(() => {
    if (!open) {
      form.resetFields()
      setFileList([])
    }
  }, [open])

  return (
    <Modal title="Tạo thương hiệu" visible={open} onCancel={onClose} footer={null} destroyOnClose>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Tên thương hiệu"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tên thương hiệu' }]}
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
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}