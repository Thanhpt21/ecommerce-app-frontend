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
import { useUpdateBrand } from '@/hooks/brand/useUpdateBrand'


export const BrandUpdateModal = ({ open, onClose, brand, refetch }: any) => {
  const [form] = Form.useForm()
  const [fileList, setFileList] = useState<any[]>([])
  const { mutateAsync, isPending } = useUpdateBrand()

  useEffect(() => {
    if (brand && open) {
      form.setFieldsValue({ title: brand.title })
      setFileList(
        brand.image
          ? [{ uid: '-1', name: 'image.jpg', status: 'done', url: brand.image }]
          : []
      )
    }
  }, [brand, open])

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj
      await mutateAsync({ id: brand.id, data: values, file })
      message.success('Cập nhật thương hiệu thành công')
      onClose()
      form.resetFields()
      refetch?.()
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi cập nhật thương hiệu')
    }
  }

  return (
    <Modal title="Cập nhật thương hiệu" visible={open} onCancel={onClose} footer={null} destroyOnClose>
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
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}
