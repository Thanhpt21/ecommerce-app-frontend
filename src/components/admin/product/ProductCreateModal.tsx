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
import { WeightUnit } from '@/enums/product.enums';

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

     // State để theo dõi các size đã chọn và số lượng của chúng
    const [selectedProductSizes, setSelectedProductSizes] = useState<{ sizeId: number; quantity: number }[]>([]);

    // Reset form fields và state khi modal đóng
    useEffect(() => {
        if (!open) {
            form.resetFields();
            setThumbFileList([]);
            setImagesFileList([]);
            setDescription('');
            setSelectedParentCategoryId(null); // Reset selected parent category
            setSelectedProductSizes([]); // Reset state
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

     // Hàm xử lý thay đổi checkbox size
    const onSizeCheckboxChange = (checkedValues: any) => {
        // `checkedValues` là mảng các `sizeId` của các checkbox được chọn
        const newSelectedProductSizes = checkedValues.map((sizeId: number) => {
            // Giữ lại quantity hiện có nếu sizeId đã tồn tại, nếu không thì mặc định là 0
            const existing = selectedProductSizes.find(ps => ps.sizeId === sizeId);
            return { sizeId, quantity: existing ? existing.quantity : 0 };
        });

        // Loại bỏ các size không còn được chọn
        const finalSelectedProductSizes = selectedProductSizes.filter(ps => checkedValues.includes(ps.sizeId));
        newSelectedProductSizes.forEach((newPs: any) => {
            if (!finalSelectedProductSizes.some(ps => ps.sizeId === newPs.sizeId)) {
                finalSelectedProductSizes.push(newPs);
            }
        });

        setSelectedProductSizes(finalSelectedProductSizes);
        // Cập nhật form field để Ant Design biết các size nào đang được chọn
        form.setFieldsValue({ productSizes: finalSelectedProductSizes });
    };

    // Hàm xử lý thay đổi số lượng cho một size cụ thể
    const onQuantityChange = (sizeId: number, value: number | null) => {
        setSelectedProductSizes(prev =>
            prev.map(ps =>
                ps.sizeId === sizeId ? { ...ps, quantity: value !== null ? value : 0 } : ps
            )
        );
        // Cập nhật form field
        form.setFieldsValue({ productSizes: selectedProductSizes.map(ps => ({ ...ps, quantity: ps.sizeId === sizeId ? (value !== null ? value : 0) : ps.quantity })) });
    };

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

           // ⭐ LOGIC MỚI: Thêm productSizes vào FormData ⭐
            if (selectedProductSizes.length > 0) {
                // Chuyển đổi mảng đối tượng thành chuỗi JSON và thêm vào formData
                formData.append('productSizes', JSON.stringify(selectedProductSizes));
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

            if (values.weight !== undefined && values.weight !== null && values.weight !== '') {
                formData.append('weight', values.weight.toString());
            }
            if (values.weightUnit !== undefined && values.weightUnit !== null) {
                formData.append('weightUnit', values.weightUnit);
            }
            if (values.unit !== undefined && values.unit !== null && values.unit !== '') {
                formData.append('unit', values.unit);
            }

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
                
               <Form.Item label="Kích thước & Số lượng">
                    {/* `name="sizeIds"` trong form Ant Design sẽ quản lý mảng các sizeId được chọn */}
                    <Checkbox.Group onChange={onSizeCheckboxChange} value={selectedProductSizes.map(ps => ps.sizeId)}>
                        <Row gutter={[16, 16]}>
                            {sizes.map((size) => (
                                <Col span={8} key={size.id}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <Checkbox value={size.id}>{size.title}</Checkbox>
                                        {/* InputNumber cho quantity, chỉ hiển thị nếu size được chọn */}
                                        {selectedProductSizes.some(ps => ps.sizeId === size.id) && (
                                            <InputNumber
                                                min={0}
                                                placeholder="SL"
                                                style={{ width: 80 }}
                                                value={selectedProductSizes.find(ps => ps.sizeId === size.id)?.quantity ?? 0}
                                                onChange={(value) => onQuantityChange(size.id, value)}
                                                onClick={e => e.stopPropagation()} // Ngăn chặn đóng dropdown khi click vào input number
                                            />
                                        )}
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Checkbox.Group>
                </Form.Item>

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
                    <Col span={12}>
                         <Form.Item label="Khối lượng" name="weight">
                            <InputNumber
                                min={0}
                                step={0.01} // Cho phép số thập phân
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
                                style={{ width: '100%' }}
                                placeholder="Nhập khối lượng"
                            />
                        </Form.Item>       
                    </Col>
                    <Col span={12}>
                        <Form.Item label="Đơn vị khối lượng" name="weightUnit">
                            <Select placeholder="Chọn đơn vị khối lượng">
                                {Object.values(WeightUnit).map((unit) => (
                                    <Select.Option key={unit} value={unit}>
                                        {unit}
                                    </Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </Col>                
                </Row>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item label="Đơn vị tính (ví dụ: cái, hộp)" name="unit">
                            <Input placeholder="Nhập đơn vị tính" />
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
