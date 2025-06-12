'use client';

import {
    Modal,
    Form,
    Input,
    Upload,
    message,
    Button,
    Select,
    Checkbox,
    Row,
    Col,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useCreateVariant } from '@/hooks/variant/useCreateVariant';

interface VariantCreateModalProps {
    open: boolean;
    onClose: () => void;
    refetch?: () => void;
    productId?: string; // Nhận productId từ trang cha
    colors: { id: number; title: string }[];
    sizes: { id: number; title: string }[];
}

export const VariantCreateModal = ({
    open,
    onClose,
    refetch,
    productId,
    colors,
    sizes,
}: VariantCreateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const { mutateAsync, isPending } = useCreateVariant();

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList?.[0]?.originFileObj;
            const imagesFiles = imagesFileList?.map((file: any) => file.originFileObj).filter(Boolean);

            if (!thumbFile) return message.error('Vui lòng chọn ảnh đại diện');
            if (!productId) return message.error('Không tìm thấy ID sản phẩm');

            const formData = new FormData();

            formData.append('productId', productId);
            formData.append('title', values.title); // Thêm title
            if (values.colorId) {
                formData.append('colorId', values.colorId);
            }
            formData.append('price', values.price);
            if (values.discount) {
                formData.append('discount', values.discount);
            }
            // Bỏ formData.append('sku', values.sku);
            if (values.sizeIds) {
                formData.append('sizeIds', JSON.stringify(values.sizeIds));
            }
            formData.append('thumb', thumbFile);
            imagesFiles.forEach(imageFile => {
                formData.append('images', imageFile);
            });

            await mutateAsync(formData);
            message.success('Tạo biến thể thành công');
            onClose();
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi tạo biến thể');
        }
    };

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
        }
    }, [open, form]);

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Tạo biến thể"
            visible={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={700}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                

                <Form.Item label="Ảnh đại diện">
                    <Upload
                        listType="picture-card"
                        fileList={thumbFileList}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                    >
                        {thumbFileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>

                <Form.Item label="Ảnh chi tiết (tùy chọn)">
                    <Upload
                        listType="picture-card"
                        fileList={imagesFileList}
                        onChange={({ fileList }) => setImagesFileList(fileList)}
                        beforeUpload={() => false}
                        accept="image/*"
                    >
                        {imagesFileList.length >= 10 ? null : uploadButton}
                    </Upload>
                </Form.Item>
                                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                        label="Tiêu đề biến thể"
                        name="title"
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề biến thể' }]}
                    >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Màu sắc" name="colorId" rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}>
                            <Select placeholder="Chọn màu sắc">
                                {colors.map((color) => (
                                    <Select.Option key={color.id} value={color.id}>
                                        {color.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="Giá"
                            name="price"
                            rules={[{ required: true, message: 'Vui lòng nhập giá' }]}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giảm giá" name="discount">
                            <Input type="number" min={0} />
                        </Form.Item>
                    </Col>
                </Row>

              

                <Form.Item label="Kích thước" name="sizeIds">
                    <Checkbox.Group>
                        {sizes.map((size) => (
                            <Checkbox key={size.id} value={size.id}>
                                {size.title}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>

                {productId && <Form.Item name="productId" initialValue={productId} style={{ display: 'none' }}>
                    <Input type="hidden" />
                </Form.Item>}

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} block>
                        Tạo mới
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};