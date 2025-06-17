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
import { useEffect, useState, useMemo } from 'react'; // Import useMemo
import { useUpdateProduct } from '@/hooks/product/useUpdateProduct';
import { ProductUpdateModalProps as OriginalProductUpdateModalProps, ProductUpdateModalProps } from '@/types/product.type'; // Import Original type
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { Category } from '@/types/category.type'; // Ensure Category type is imported
import { useProductSizes } from '@/hooks/product-sizes/useProductSizes';




export const ProductUpdateModal = ({
    open,
    onClose,
    product,
    refetch,
    colors,
    categories, // This is the flat list of all categories
    brands,
    sizes, // Renamed from allSizes for consistency
}: ProductUpdateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const { mutateAsync, isPending } = useUpdateProduct();
    // State để lưu trữ ID của danh mục cha được chọn
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);

    const { data: selectedSizes, isLoading: isSizesLoading, error: sizesError } = useProductSizes(product?.id);

    // Reset form fields và state khi modal đóng hoặc khi product thay đổi
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null); // Reset selected parent category
        } else if (product && open) {
            // Xác định danh mục cha và con ban đầu
            const currentCategory = categories.find(cat => cat.id === product.categoryId);
            let initialParentCategoryId: number | null = null;
            let initialSubCategoryId: number | null = null; // Changed to number | null for consistency

            if (currentCategory) {
                if (currentCategory.parentId === null) {
                    // Nếu là danh mục cha
                    initialParentCategoryId = currentCategory.id;
                    initialSubCategoryId = null; // Explicitly null for sub-category
                } else {
                    // Nếu là danh mục con
                    initialSubCategoryId = currentCategory.id;
                    // FIX: Sử dụng nullish coalescing để đảm bảo nó là null, không phải undefined
                    initialParentCategoryId = currentCategory.parentId ?? null; 
                }
            }

            form.setFieldsValue({
                title: product.title,
                code: product.code,
                price: product.price,
                discount: product.discount,
                tags: product.tags?.join(', '),
                brandId: product.brandId,
                slug: product.slug,
                // categoryId: product.categoryId, // Sẽ được xử lý bởi parentCategoryId/subCategoryId
                colorId: product.colorId,
                // slug: product.slug, // REMOVED SLUG FIELD
                parentCategoryId: initialParentCategoryId, // Set initial parent category
                subCategoryId: initialSubCategoryId, // Set initial sub category
                description : product.description
            });
            setDescription(product.description || '');
            setSelectedParentCategoryId(initialParentCategoryId); // Set state for dynamic sub-category loading

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
        }
    }, [product, open, form, categories]); // Add categories to dependency array

    useEffect(() => {
        if (selectedSizes && open) {
            const initialSizeIds = selectedSizes.map((size) => size.id);
            form.setFieldsValue({
                sizeIds: initialSizeIds,
            });
        }
    }, [selectedSizes, open, form]);

    // Lọc ra các danh mục cha (parentId là null) để hiển thị trong Select đầu tiên
    const parentCategories = useMemo(() => {
        return categories.filter(cat => cat.parentId === null);
    }, [categories]);

    // Lọc ra các danh mục con trực tiếp của danh mục cha đã chọn
    const subCategories = useMemo(() => {
        if (selectedParentCategoryId === null) {
            return [];
        }
        return categories.filter(cat => cat.parentId === selectedParentCategoryId);
    }, [categories, selectedParentCategoryId]);

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
            if (values.discount !== undefined && values.discount !== null && values.discount !== '') {
                formData.append('discount', values.discount.toString()); // Convert to string for FormData
            } else {
                formData.append('discount', '0'); // Default to 0 or handle as per backend requirements
            }
            if (values.tags) {
                const tagsArray = values.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean);
                tagsArray.forEach((tag: string) => {
                    formData.append('tags[]', tag); // Append each tag individually
                });
            }
            if (values.sizeIds && values.sizeIds.length > 0) {
                values.sizeIds.forEach((sizeId: number) => { // Đảm bảo 'id' có kiểu là number
                    // Thêm từng sizeId dưới dạng một trường 'sizeIds[]' riêng biệt
                    formData.append('sizeIds[]', sizeId.toString()); // Chuyển số thành chuỗi để FormData xử lý
                });
            } else {
                // Ví dụ: formData.append('sizeIds[]', ''); // Nếu backend cực kỳ nghiêm ngặt
            }
            formData.append('brandId', values.brandId);
            formData.append('colorId', values.colorId);
            formData.append('description', description);

            // ⭐ LOGIC MỚI: Xác định categoryId để gửi đi ⭐
            let finalCategoryId: number | null = null;
            if (values.subCategoryId !== undefined && values.subCategoryId !== null) {
                // Ưu tiên subCategory nếu được chọn
                finalCategoryId = values.subCategoryId;
            } else if (values.parentCategoryId !== undefined && values.parentCategoryId !== null) {
                // Nếu không có subCategory, dùng parentCategory
                finalCategoryId = values.parentCategoryId;
            }

            if (finalCategoryId !== null) {
                formData.append('categoryId', finalCategoryId.toString());
            } else {
                // Nếu cả hai đều không được chọn và categoryId là bắt buộc
                message.error('Vui lòng chọn một danh mục (cha hoặc con).');
                return; // Ngăn chặn việc gửi form
            }

            // Append file thumb nếu có file mới được chọn
            if (thumbFile) {
                formData.append('thumb', thumbFile);
            } else if (thumbFileList[0]?.url && !thumbFileList[0]?.originFileObj) {
                // Nếu không có file mới nhưng có URL cũ, chỉ gửi URL nếu backend cần (hoặc bỏ qua)
                // Hiện tại, không cần gửi lại URL nếu không có thay đổi file, backend nên giữ nguyên
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
                        label="Slug"
                        name="slug"
                        rules={[{ required: true, message: 'Vui lòng nhập slug' }]}
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
                <Row gutter={16}>
                    <Col span={12}> {/* Sizes */}
                        <Form.Item label="Kích thước" name="sizeIds">
                            <Checkbox.Group>
                                {sizes.map((size) => (
                                    <Checkbox key={size.id} value={size.id}>
                                        {size.title}
                                    </Checkbox>
                                ))}
                            </Checkbox.Group>
                        </Form.Item>
                    </Col>
                </Row>
                {/* Row for Sizes and Colors */}
                <Row gutter={16}>
                    
                    <Col span={12}> {/* Colors */}
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
                    <Col span={12}> {/* Brand */}
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
                </Row>

                {/* Row for Brand, Parent Category, Subcategory */}
                <Row gutter={16}>
                    
                    <Col span={12}> {/* Parent Category */}
                        <Form.Item
                            label="Danh mục cha"
                            name="parentCategoryId"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục cha' }]}
                        >
                            <Select
                                placeholder="Chọn Danh mục cha"
                                allowClear
                                onChange={(value: number | null) => {
                                    setSelectedParentCategoryId(value);
                                    form.setFieldsValue({ subCategoryId: undefined }); // Reset danh mục con khi danh mục cha thay đổi
                                }}
                            >
                                {parentCategories.map((category: Category) => (
                                    <Select.Option key={category.id} value={category.id}>
                                        {category.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}> {/* Subcategory */}
                        <Form.Item
                            label="Danh mục con (tùy chọn)"
                            name="subCategoryId"
                        >
                            <Select
                                placeholder="Chọn Danh mục con"
                                allowClear
                                disabled={selectedParentCategoryId === null || subCategories.length === 0} // Disabled nếu chưa chọn cha hoặc không có con
                            >
                                {subCategories.map((subCat: Category) => (
                                    <Select.Option key={subCat.id} value={subCat.id}>
                                        {subCat.title}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
                    <DynamicRichTextEditor key={`editor-${product?.id}`} value={description} onChange={setDescription} />
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
