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
import { useEffect, useState } from 'react';
import { useUpdateVariant } from '@/hooks/variant/useUpdateVariant';
import { VariantUpdateModalProps, Variant, VariantSizeDetail, Color } from '@/types/variant.type'; // Import Color và VariantSize types
import { useVariantSizes } from '@/hooks/variant-sizes/useVariantSizes';
import { useQueryClient } from '@tanstack/react-query';

export const VariantUpdateModal = ({
    open,
    onClose,
    variant,
    refetch,
    colors,
    sizes: allSizes, // allSizes should be Size[]
    productId: propProductId,
}: VariantUpdateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const { mutateAsync, isPending } = useUpdateVariant();

    // Lấy dữ liệu VariantSizes, đổi tên biến để dễ phân biệt
    const { data: fetchedVariantSizesResponse, isLoading: isSizesLoading, error: sizesError } = useVariantSizes(variant?.id);
    const productId = propProductId;

    // State để lưu trữ các size đã chọn và số lượng của chúng
    const [selectedVariantSizes, setSelectedVariantSizes] = useState<{ sizeId: number; quantity: number }[]>([]);
    const queryClient = useQueryClient();



    useEffect(() => {
        if (variant && open) {
            form.setFieldsValue({
                title: variant.title,
                price: variant.price ?? 0,
                discount: variant.discount ?? 0,
                colorId: variant.colorId,
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
            setSelectedVariantSizes([]);
        }
    }, [variant, open, form]);

    useEffect(() => {
        // Kiểm tra fetchedVariantSizesResponse và data bên trong
        if (open && fetchedVariantSizesResponse?.data) {
            // Ép kiểu `vs` thành `VariantSize` để TypeScript nhận diện
            const initialVariantSizes = fetchedVariantSizesResponse.data.map((vs: VariantSizeDetail) => ({
                sizeId: vs.sizeId, // SỬA: Lấy vs.sizeId, đây là ID của kích thước thực tế (S, M, L)
                quantity: vs.quantity,
            }));
            setSelectedVariantSizes(initialVariantSizes);

            const checkedSizeIds = initialVariantSizes.map(vs => vs.sizeId);
            form.setFieldsValue({
                variantSizeQuantities: checkedSizeIds,
            });
        }
    }, [open, fetchedVariantSizesResponse, form]); // Thêm fetchedVariantSizesResponse vào dependency array

    // Hàm xử lý thay đổi checkbox size
    const onSizeCheckboxChange = (checkedValues: any[]) => {
        const checkedSizeIds = checkedValues.map(Number); // Đảm bảo ID là kiểu số

        const newSelectedVariantSizes = checkedSizeIds.map((sizeId: number) => {
            const existing = selectedVariantSizes.find(vs => vs.sizeId === sizeId);
            return { sizeId, quantity: existing ? existing.quantity : 0 };
        });

        setSelectedVariantSizes(newSelectedVariantSizes);
    };

    // Hàm xử lý thay đổi số lượng cho một size cụ thể
    const onQuantityChange = (sizeId: number, value: number | null) => {
        setSelectedVariantSizes(prev =>
            prev.map(vs =>
                vs.sizeId === sizeId ? { ...vs, quantity: value !== null ? value : 0 } : vs
            )
        );
    };

    const onFinish = async (values: any) => {
        try {
            const thumbFile = thumbFileList?.[0]?.originFileObj;
            const imagesFiles = imagesFileList?.map((file: any) => file.originFileObj).filter(Boolean);

            const formData = new FormData();


            formData.append('title', values.title);
            formData.append('price', values.price.toString());
            if (values.discount !== undefined && values.discount !== null && values.discount !== '') {
                formData.append('discount', values.discount.toString());
            } else {
                formData.append('discount', '0');
            }
            if (values.colorId !== undefined && values.colorId !== null) {
                formData.append('colorId', values.colorId.toString());
            }

            if (selectedVariantSizes.length > 0) {
                formData.append('variantSizes', JSON.stringify(selectedVariantSizes));
            } else {
                formData.append('variantSizes', '[]');
            }

            if (thumbFile) {
                formData.append('thumb', thumbFile);
            }

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
            queryClient.invalidateQueries({ queryKey: ['variantSizes', variant.id] });
            queryClient.invalidateQueries({ queryKey: ['variants'] });

        } catch (err: any) {
            console.error('Lỗi khi cập nhật biến thể:', err);
            message.error(err?.response?.data?.message || 'Lỗi cập nhật biến thể');
        }
    };

    const uploadButton = <Button icon={<UploadOutlined />}>Chọn ảnh</Button>;

    return (
        <Modal
            title="Cập nhật biến thể"
            visible={open} // Correct Ant Design v5+ prop
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
                            <Select placeholder="Chọn màu sắc" allowClear>
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

                <Form.Item label="Kích thước & Số lượng" name="variantSizeQuantities">
                    <Checkbox.Group
                        onChange={onSizeCheckboxChange}
                        value={selectedVariantSizes.map(vs => vs.sizeId)}
                    >
                        <Row gutter={[16, 16]}>
                            {allSizes.map((size) => (
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
                                                onClick={e => e.stopPropagation()}
                                            />
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
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