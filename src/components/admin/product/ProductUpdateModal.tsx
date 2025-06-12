'use client';

import {
    Modal,
    Form,
    Input,
    Upload,
    message,
    Button,
    Select,
    Checkbox, // Thay vì Select mode="multiple"
    Row,
    Col,
    InputNumber,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { useUpdateProduct } from '@/hooks/product/useUpdateProduct';
import { ProductUpdateModalProps } from '@/types/product.type';
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { useProductSizes } from '@/hooks/product-sizes/useProductSizes';


export const ProductUpdateModal = ({
    open,
    onClose,
    product,
    refetch,
    colors,
    categories,
    brands,
    sizes: allSizes,
}: ProductUpdateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const { mutateAsync, isPending } = useUpdateProduct();
    const [description, setDescription] = useState('');

    const { data: selectedSizes, isLoading: isSizesLoading, error: sizesError } = useProductSizes(product?.id);

    useEffect(() => {
        if (product && open) {
            form.setFieldsValue({
                title: product.title,
                code: product.code,
                price: product.price,
                discount: product.discount,
                tags: product.tags?.join(', '),
                brandId: product.brandId,
                categoryId: product.categoryId,
                colorId: product.colorId,
                description: product.description,
                slug: product.slug, 
                // sizeIds sẽ được set sau khi selectedSizes load xong
            });
            setDescription(product.description || '');
            setThumbFileList(
                product.thumb
                    ? [{ uid: '-1-thumb', name: 'thumb', status: 'done', url: product.thumb }]
                    : []
            );
            setImagesFileList(
                product.images?.map((url, index) => ({
                    uid: `-${index}-image`,
                    name: `image-${index}`,
                    status: 'done',
                    url: url,
                })) || []
            );
        } else if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
        }
    }, [product, open, form]);

    useEffect(() => {
        if (selectedSizes && open) {
            const initialSizeIds = selectedSizes.map((size) => size.id);
            form.setFieldsValue({
                sizeIds: initialSizeIds,
            });
        }
    }, [selectedSizes, open, form]);

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList?.[0]?.originFileObj;
            const imagesFiles = imagesFileList?.map((file: any) => file.originFileObj).filter(Boolean);

            const formData = new FormData();

            // Append các trường text từ form values
            formData.append('title', values.title);
             formData.append('slug', values.slug);
            formData.append('code', values.code);
            formData.append('price', values.price);
            if (values.discount) {
                formData.append('discount', values.discount);
            }
            if (values.tags) {
                formData.append('tags', values.tags);
            }
            if (values.sizeIds) {
              formData.append('sizeIds', JSON.stringify(values.sizeIds));
            }
            formData.append('brandId', values.brandId);
            formData.append('categoryId', values.categoryId);
            formData.append('colorId', values.colorId);
            formData.append('description', description);

            // Append file thumb nếu có file mới được chọn
            if (thumbFile) {
                formData.append('thumb', thumbFile);
            } else if (thumbFileList[0]?.url && !thumbFileList[0]?.originFileObj) {
                // Nếu không có file mới nhưng có URL cũ, có thể gửi lại URL hoặc bỏ qua tùy logic backend
                // Ví dụ: formData.append('thumb', thumbFileList[0].url);
            }

            // Append các file images mới
            imagesFiles.forEach(imageFile => {
                formData.append('images', imageFile);
            });

            if (!product) {
                message.error('Không tìm thấy sản phẩm để cập nhật');
                return;
            }
            await mutateAsync({ id: product.id, data: formData }); // Gửi formData trong data
            message.success('Cập nhật sản phẩm thành công');
            onClose();
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi cập nhật sản phẩm');
        }
    };

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Cập nhật sản phẩm"
            visible={open}
            onCancel={onClose}
            footer={null}
            destroyOnClose
            width={800}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Ảnh đại diện">
                    <Upload
                        listType="picture-card"
                        fileList={thumbFileList}
                        maxCount={1}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
                        accept="image/*"
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
                            label="Slug"
                            name="slug"
                            rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
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
                        {allSizes.map((size) => (
                            <Checkbox key={size.id} value={size.id}>
                                {size.title}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
                </Form.Item>

                <Row gutter={16}>
                    <Col span={8}>
                        <Form.Item label="Thương hiệu" name="brandId"  rules={[{ required: true, message: 'Vui lòng chọn thương hiệu' }]}>
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
                        <Form.Item label="Danh mục" name="categoryId" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
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
                        <Form.Item label="Màu sắc" name="colorId" rules={[{ required: true, message: 'Vui lòng chọn màu sắc' }]}>
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

                  <Form.Item label="Mô tả" name="description">
                    <DynamicRichTextEditor  key={`editor-${product?.id}`} value={description} onChange={setDescription} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={isPending} block>
                        Cập nhật
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};