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
import { useEffect, useState } from 'react';
import { useUpdateVariant } from '@/hooks/variant/useUpdateVariant';
import { VariantUpdateModalProps, Variant } from '@/types/variant.type'; // Import Variant type
import { useVariantSizes } from '@/hooks/variant-sizes/useVariantSizes';

export const VariantUpdateModal = ({
    open,
    onClose,
    variant,
    refetch,
    colors,
    sizes: allSizes,
    productId: propProductId,
}: VariantUpdateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const { mutateAsync, isPending } = useUpdateVariant();
    const { data: selectedSizes, isLoading: isSizesLoading, error: sizesError } = useVariantSizes(variant?.id);
    const productId = propProductId; // Sử dụng productId prop nếu có

    useEffect(() => {
        if (variant && open) {
            form.setFieldsValue({
                title: variant.title, // Thêm dòng này
                price: variant.price,
                discount: variant.discount,
                colorId: variant.colorId,
                // sizeIds sẽ được set sau khi selectedSizes load xong
            });
            setThumbFileList(
                variant.thumb
                    ? [{ uid: '-1-thumb', name: 'thumb', status: 'done', url: variant.thumb }]
                    : []
            );
            setImagesFileList(
                variant.images?.map((url, index) => ({
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
        }
    }, [variant, open, form]);

    useEffect(() => {
        if (selectedSizes && open) {
            const initialSizeIds = selectedSizes.map((size) => size.id); // Giả sử sizeId trong response
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

            if (productId) {
                formData.append('productId', productId);
            }
            formData.append('title', values.title); // Thêm title vào formData
            formData.append('price', values.price);
            if (values.discount !== undefined) {
                formData.append('discount', values.discount);
            }
            if (values.colorId !== undefined) {
                formData.append('colorId', values.colorId);
            }
            if (values.sizeIds) {
                formData.append('sizeIds', JSON.stringify(values.sizeIds));
            }

            // Append file thumb nếu có file mới được chọn
            if (thumbFile) {
                formData.append('thumb', thumbFile);
            }

            // Append các file images mới
            imagesFiles.forEach(imageFile => {
                formData.append('images', imageFile);
            });

            if (!variant) {
                message.error('Không tìm thấy biến thể để cập nhật');
                return;
            }
            await mutateAsync({ id: variant.id, data: formData });
            message.success('Cập nhật biến thể thành công');
            onClose();
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi cập nhật biến thể');
        }
    };

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Cập nhật biến thể"
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
                        maxCount={1}
                        onChange={({ fileList }) => setThumbFileList(fileList.slice(-1))}
                        beforeUpload={() => false}
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
                        <Form.Item label="Màu sắc" name="colorId">
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
                        {allSizes.map((size) => (
                            <Checkbox key={size.id} value={size.id}>
                                {size.title}
                            </Checkbox>
                        ))}
                    </Checkbox.Group>
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