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
    Row, // Import Row
    Col,
    InputNumber, // Import Col
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useCreateProduct } from '@/hooks/product/useCreateProduct';
import { ProductCreateModalProps } from '@/types/product.type';
import DynamicRichTextEditor from '@/components/common/RichTextEditor';


export const ProductCreateModal = ({
    open,
    onClose,
    refetch,
    colors,
    categories,
    brands,
    sizes,
}: ProductCreateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const { mutateAsync, isPending } = useCreateProduct();
    const [description, setDescription] = useState('');

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList?.[0]?.originFileObj;
            const imagesFiles = imagesFileList?.map((file: any) => file.originFileObj).filter(Boolean);

            if (!thumbFile) return message.error('Vui lòng chọn ảnh đại diện');

            const formData = new FormData();

            // Append các trường text từ form values
            formData.append('title', values.title);
            formData.append('code', values.code);
            formData.append('price', values.price);
            if (values.discount) {
                formData.append('discount', values.discount);
            }
            if (values.tags) {
                formData.append('tags', JSON.stringify(values.tags.split(',').map((tag: string) => tag.trim())));
            }
            if (values.sizeIds) {
                formData.append('sizeIds', JSON.stringify(values.sizeIds));
            }
            formData.append('brandId', values.brandId);
            formData.append('categoryId', values.categoryId);
            formData.append('colorId', values.colorId);
            formData.append('description', description);

            // Append file thumb
            formData.append('thumb', thumbFile);

            // Append các file images
            imagesFiles.forEach(imageFile => {
                formData.append('images', imageFile);
            });

            await mutateAsync(formData); // Gửi formData thay vì payload
            message.success('Tạo sản phẩm thành công');
            onClose();
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi tạo sản phẩm');
        }
    };

    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
        } else if (open && form) {
            // Nếu bạn muốn load lại description khi mở lại (có thể không cần thiết cho create)
            form.setFieldsValue({ description: description });
        }
    }, [open, form]);

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal title="Tạo sản phẩm" visible={open} onCancel={onClose} footer={null} destroyOnClose width={800}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Ảnh đại diện">
                    <Upload
                        listType="picture-card"
                        fileList={thumbFileList}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                        style={{ width: '100%' }} // Thử set width 100%
                        className={thumbFileList.length === 0 ? 'custom-upload-empty' : ''}
                    >
                        {thumbFileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </Form.Item>

                <Form.Item label="Ảnh chi tiết">
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
                            label="Tên sản phẩm"
                            name="title"
                            rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                        >
                            <Input />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Mã sản phẩm"
                            name="code"
                            rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}
                        >
                            <Input />
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
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Giảm giá (đ)" name="discount">
                           <InputNumber
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Tags (cách nhau bằng dấu phẩy)" name="tags">
                    <Input />
                </Form.Item>

                <Form.Item label="Sizes" name="sizeIds">
                    <Checkbox.Group>
                        {sizes.map((size) => (
                            <Checkbox key={size.id} value={size.id}>
                                {size.title}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item
                            label="Thương hiệu"
                            name="brandId"
                            rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}
                        >
                            <Select placeholder="Chọn Thương hiệu">
                                {brands.map((brand) => (
                                    <Select.Option key={brand.id} value={brand.id}>
                                        {brand.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Danh mục"
                            name="categoryId"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}
                        >
                            <Select placeholder="Chọn Danh mục">
                                {categories.map((category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={8}>
                        <Form.Item
                            label="Màu sắc"
                            name="colorId"
                            rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}
                        >
                            <Select placeholder="Chọn Màu sắc">
                                {colors.map((color) => (
                                    <Select.Option key={color.id} value={color.id}>
                                        {color.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <DynamicRichTextEditor value={description} onChange={setDescription} />
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