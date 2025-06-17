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
import { useCreateProduct } from '@/hooks/product/useCreateProduct';
// import { ProductCreateModalProps } from '@/types/product.type'; // Removed this import if it was defining categories incorrectly
import DynamicRichTextEditor from '@/components/common/RichTextEditor';
import { Category } from '@/types/category.type'; // Ensure Category type is imported

// Cập nhật ProductCreateModalProps để categories sử dụng kiểu Category[]
export interface ProductCreateModalProps {
    open: boolean;
    onClose: () => void;
    refetch?: () => void; // refetch can be optional
    colors: { id: number; title: string }[]; // Assuming id is number based on other parts
    categories: Category[]; // Đã thay đổi từ { id: string; title: string }[] sang Category[]
    brands: { id: number; title: string }[]; // Assuming id is number
    sizes: { id: number; title: string }[]; // Assuming id is number
}


export const ProductCreateModal = ({
    open,
    onClose,
    refetch,
    colors,
    categories, // This is the flat list of all categories
    brands,
    sizes,
}: ProductCreateModalProps) => {
    const [form] = Form.useForm();
    const [thumbFileList, setThumbFileList] = useState<any[]>([]);
    const [imagesFileList, setImagesFileList] = useState<any[]>([]);
    const [description, setDescription] = useState('');
    const { mutateAsync, isPending } = useCreateProduct();
    // State để lưu trữ ID của danh mục cha được chọn
    const [selectedParentCategoryId, setSelectedParentCategoryId] = useState<number | null>(null);

    // Reset form fields và state khi modal đóng
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null); // Reset selected parent category
        }
    }, [open, form]);

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

            if (!thumbFile) {
                message.error('Vui lòng chọn ảnh đại diện');
                return;
            }

            const formData = new FormData();

            formData.append('title', values.title);
            formData.append('code', values.code);
            formData.append('price', values.price);
            
            // ⭐ CORRECTED: Handle discount as a number ⭐
            if (values.discount !== undefined && values.discount !== null && values.discount !== '') {
                formData.append('discount', values.discount.toString()); // Convert to string for FormData
            } else {
                formData.append('discount', '0'); // Default to 0 or handle as per backend requirements
            }
            
            // ⭐ CORRECTED: Handle tags as an array of strings ⭐
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
                // Nếu không có kích thước nào được chọn, có thể không cần thêm vào FormData,
                // hoặc thêm một giá trị rỗng nếu backend yêu cầu một mảng rỗng rõ ràng.
                // Ví dụ: formData.append('sizeIds[]', ''); // Nếu backend cực kỳ nghiêm ngặt
            }
                        
            formData.append('brandId', values.brandId);
            formData.append('colorId', values.colorId);
            formData.append('description', description);

            let finalCategoryId: number | null = null;
            if (values.subCategoryId !== undefined && values.subCategoryId !== null) {
                finalCategoryId = values.subCategoryId;
            } else if (values.parentCategoryId !== undefined && values.parentCategoryId !== null) {
                finalCategoryId = values.parentCategoryId;
            }

            if (finalCategoryId !== null) {
                formData.append('categoryId', finalCategoryId.toString());
            } else {
                message.error('Vui lòng chọn một danh mục (cha hoặc con).');
                return;
            }

            formData.append('thumb', thumbFile);

            imagesFiles.forEach(imageFile => {
                formData.append('images', imageFile);
            });

            await mutateAsync(formData);
            message.success('Tạo sản phẩm thành công');
            onClose();
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null);
            refetch?.();
        } catch (err: any) {
            message.error(err?.response?.data?.message || 'Lỗi tạo sản phẩm');
        }
    };

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
                        style={{ width: '100%' }}
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
                
                {/* FIRST NEW ROW: Sizes and Colors */}
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

                {/* SECOND NEW ROW: Brand, Parent Category, Subcategory */}
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
