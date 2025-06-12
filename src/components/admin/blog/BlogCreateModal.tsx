'use client';

import { useCreateBlog } from '@/hooks/blog/useCreateBlog';
import { useAllBlogCategories } from '@/hooks/blog-category/useAllBlogCategories';
import {
  Modal,
  Form,
  Input,
  message,
  Button,
  Upload,
  Select,
  Switch,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { BlogCategory } from '@/types/blog-category.type';

interface BlogCreateModalProps {
  open: boolean;
  onClose: () => void;
  refetch?: () => void;
}

interface ContentItem {
  title: string;
  body: string;
}

export const BlogCreateModal = ({ open, onClose, refetch }: BlogCreateModalProps) => {
  const [form] = Form.useForm();
  const { mutateAsync, isPending } = useCreateBlog();
  const [contentItems, setContentItems] = useState<ContentItem[]>([{ title: '', body: '' }]);
  const [fileList, setFileList] = useState<any[]>([]);
  const { data: categories, isLoading: isCategoriesLoading } = useAllBlogCategories();

  const onFinish = async (values: any) => {
    try {
      const file = fileList?.[0]?.originFileObj;
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      if (file) {
        formData.append('thumb', file);
      }
      formData.append('categoryId', values.categoryId);
      formData.append('isPublished', values.isPublished ? 'true' : 'false');
      formData.append('content', JSON.stringify(contentItems));

      await mutateAsync(formData);
      message.success('Tạo blog thành công');
      onClose();
      form.resetFields();
      setFileList([]);
      setContentItems([{ title: '', body: '' }]);
      refetch?.();
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Lỗi tạo blog');
    }
  };

  const handleAddContentItem = () => {
    setContentItems([...contentItems, { title: '', body: '' }]);
  };

  const handleContentItemChange = (index: number, name: 'title' | 'body', value: string) => {
    const newContentItems = [...contentItems];
    newContentItems[index][name] = value;
    setContentItems(newContentItems);
  };

  const handleRemoveContentItem = (index: number) => {
    const newContentItems = contentItems.filter((_, i) => i !== index);
    setContentItems(newContentItems);
  };

  const handleThumbChange = ({ fileList: newFileList }: any) => {
    setFileList(newFileList);
  };

  useEffect(() => {
    if (!open) {
      form.resetFields();
      setFileList([]);
      setContentItems([{ title: '', body: '' }]);
    }
  }, [open, form]);

  return (
    <Modal
      title="Tạo Blog"
      visible={open}
      onCancel={onClose}
      footer={null}
      width={800}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item label="Ảnh Thumbnail">
          <Upload
            listType="picture"
            fileList={fileList}
            onChange={handleThumbChange}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          label="Tiêu đề"
          name="title"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Mô tả ngắn"
          name="description"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả ngắn' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item
          label="Danh mục"
          name="categoryId"
          rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
        >
          <Select
            loading={isCategoriesLoading}
            placeholder="Chọn danh mục"
          >
            {categories?.map((cat: BlogCategory) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.title}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          label="Nội dung"
        >
          {contentItems.map((item, index) => (
            <div key={index} style={{ marginBottom: 24, border: '1px solid #f0f0f0', padding: 16, borderRadius: 6 }}>
              <h3>Phần tử nội dung #{index + 1}</h3>
              <Form.Item
                label="Tiêu đề phần tử"
                rules={[{ required: true, message: 'Vui lòng nhập tiêu đề cho phần tử nội dung' }]}
              >
                <Input
                  value={item.title}
                  onChange={(e) => handleContentItemChange(index, 'title', e.target.value)}
                />
              </Form.Item>
              <Form.Item
                label="Nội dung"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
              >
                <div style={{ border: '1px solid #d9d9d9', borderRadius: 4 }}>
                  <DynamicRichTextEditor
                    value={item.body}
                    onChange={(value) => handleContentItemChange(index, 'body', value)}
                    height={300}
                  />
                </div>
              </Form.Item>
              {contentItems.length > 1 && (
                <Button danger onClick={() => handleRemoveContentItem(index)}>
                  Xóa phần tử này
                </Button>
              )}
            </div>
          ))}
          <Button type="dashed" onClick={handleAddContentItem} block>
            Thêm phần tử nội dung
          </Button>
        </Form.Item>

        <Form.Item
          label="Trạng thái xuất bản"
          name="isPublished"
          valuePropName="checked"
          initialValue={false}
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isPending} block>
            Tạo mới
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};