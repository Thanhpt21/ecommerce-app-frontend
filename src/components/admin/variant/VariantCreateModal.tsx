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
    InputNumber,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useCreateVariant } from '@/hooks/variant/useCreateVariant';

interface SelectedVariantSize {
    sizeId: number;
    quantity: number;
}

interface VariantCreateModalProps {
    open: boolean;
    onClose: () => void;
    refetch?: () => void;
    productId?: string; // Changed to number as per backend DTO
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

    const [selectedVariantSizes, setSelectedVariantSizes] = useState<SelectedVariantSize[]>([]);

    // Reset form fields and state when modal closes
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setSelectedVariantSizes([]); // ⭐ RESET NEW STATE ⭐
        }
    }, [open, form]);

    // ⭐ NEW LOGIC: Handle size checkbox changes ⭐
    const onSizeCheckboxChange = (checkedValues: any[]) => {
        const newSelectedVariantSizes: SelectedVariantSize[] = checkedValues.map((sizeId: number) => {
            // Keep existing quantity if sizeId was already selected, otherwise default to 0
            const existing = selectedVariantSizes.find(vs => vs.sizeId === sizeId);
            return { sizeId, quantity: existing ? existing.quantity : 0 };
        });

        // Filter out sizes that are no longer checked
        const finalSelectedVariantSizes = selectedVariantSizes.filter(vs =>
            checkedValues.includes(vs.sizeId)
        );

        // Add newly checked sizes
        newSelectedVariantSizes.forEach((newVs) => {
            if (!finalSelectedVariantSizes.some(vs => vs.sizeId === newVs.sizeId)) {
                finalSelectedVariantSizes.push(newVs);
            }
        });

        setSelectedVariantSizes(finalSelectedVariantSizes);
        // ⭐ Update form field so Ant Design form context knows about these values ⭐
        // This is crucial for `values.variantSizes` in `onFinish`
        form.setFieldsValue({ variantSizes: finalSelectedVariantSizes });
    };

    // ⭐ NEW LOGIC: Handle quantity changes for a specific size ⭐
    const onQuantityChange = (sizeId: number, value: number | null) => {
        setSelectedVariantSizes(prev =>
            prev.map(vs =>
                vs.sizeId === sizeId ? { ...vs, quantity: value !== null ? value : 0 } : vs
            )
        );
        // ⭐ Update form field to reflect the quantity change ⭐
        form.setFieldsValue({
            variantSizes: selectedVariantSizes.map(vs => ({
                ...vs,
                quantity: vs.sizeId === sizeId ? (value !== null ? value : 0) : vs.quantity
            }))
        });
    };

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
              if (values.discount !== undefined && values.discount !== null && values.discount !== '') {
                formData.append('discount', values.discount.toString()); // Convert discount to string
            } else {
                formData.append('discount', '0'); // Default to 0 if not provided
            }
            // ⭐ NEW LOGIC: Append variantSizes as a JSON string to FormData ⭐
            if (selectedVariantSizes.length > 0) {
                formData.append('variantSizes', JSON.stringify(selectedVariantSizes));
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
            setSelectedVariantSizes([]);
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi tạo biến thể');
        }
    };



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
                            <InputNumber 
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                 type="number" 
                                 min={0} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giảm giá" name="discount">
                            <InputNumber
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                            type="number" min={0} />
                        </Form.Item>
                    </Col>
                </Row>

              

                <Form.Item label="Kích thước & Số lượng" name="variantSizes"> {/* `name` here is for Ant Design form context */}
                    <Checkbox.Group onChange={onSizeCheckboxChange} value={selectedVariantSizes.map(vs => vs.sizeId)}>
                        <Row gutter={[16, 16]}>
                            {sizes.map((size) => (
                                <Col span={8} key={size.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Checkbox value={size.id}>{size.title}</Checkbox>
                                        {selectedVariantSizes.some(vs => vs.sizeId === size.id) && (
                                            <InputNumber
                                                min={0}
                                                placeholder="SL"
                                                style={{ width: 80 }}
                                                value={selectedVariantSizes.find(vs => vs.sizeId === size.id)?.quantity ?? 0}
                                                onChange={(value) => onQuantityChange(size.id, value)}
                                                onClick={e => e.stopPropagation()} // Prevent closing dropdown/propagating click
                                            />
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
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