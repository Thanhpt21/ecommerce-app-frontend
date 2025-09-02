// src/components/NewAddressForm.tsx
'use client';

import { Input, Row, Col, message, Form, Checkbox, Select, Alert, Button } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { ShippingAddress as ShippingAddressType } from '@/types/shipping-address.type';

import { Province, District, Ward } from '@/types/address.type';
import { useProvinces } from '@/hooks/address/useProvinces';
import { useDistricts } from '@/hooks/address/useDistricts';
import { useWards } from '@/hooks/address/useWards';

type AddressFormValues = Omit<ShippingAddressType, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;

interface NewAddressFormProps {
  onSave: (addressData: AddressFormValues) => void;
  onCancel: () => void;
  initialValues?: AddressFormValues;
}

const { Option } = Select;

const NewAddressForm: React.FC<NewAddressFormProps> = ({ onSave, onCancel, initialValues }) => {
  const [form] = Form.useForm();

  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>(undefined);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>(undefined);
  const [selectedWardCode, setSelectedWardCode] = useState<string | undefined>(undefined);

  // Dùng để kiểm soát việc reset các dropdown khi người dùng thay đổi lựa chọn
  // và tránh reset khi form được nạp initialValues lần đầu
  const isUserChangeRef = useRef(false);

  const { data: provinces, isLoading: loadingProvinces, isError: errorProvinces, error: provincesError } = useProvinces();
  const { data: districts, isLoading: loadingDistricts, isError: errorDistricts, error: districtsError } = useDistricts(selectedProvinceCode);
  const { data: wards, isLoading: loadingWards, isError: errorWards, error: wardsError } = useWards(selectedDistrictCode);

  // ⭐ Logic chính để khởi tạo form và state khi initialValues thay đổi ⭐
  // Effect này sẽ chạy khi modal mở và có initialValues
  useEffect(() => {
    if (!initialValues) {
      // Nếu không có initialValues (thêm mới), reset toàn bộ form và các state địa chỉ
      form.resetFields();
      setSelectedProvinceCode(undefined);
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
      isUserChangeRef.current = false; // Đặt lại cờ cho lần nhập liệu mới
      return;
    }

    // Khi có initialValues, set các trường thông thường
    form.setFieldsValue({
      fullName: initialValues.fullName,
      phone: initialValues.phone,
      address: initialValues.address,
      isDefault: initialValues.isDefault,
    });

    // Chỉ thực hiện tìm kiếm code nếu danh sách tỉnh đã tải xong
    if (provinces && !loadingProvinces) {
      const provinceFound = provinces.find(p => p.name === initialValues.province);
      if (provinceFound) {
        setSelectedProvinceCode(provinceFound.code);
        form.setFieldsValue({ province: provinceFound.code }); // Cập nhật form
      } else {
        setSelectedProvinceCode(undefined);
        form.setFieldsValue({ province: undefined });
      }
    }
    // Sau khi nạp initialValues, cho phép các thay đổi của người dùng trigger reset
    isUserChangeRef.current = false;
  }, [initialValues, form, provinces, loadingProvinces]);

  // ⭐ Effect để load districts và set selectedDistrictCode ⭐
  // Chạy khi selectedProvinceCode hoặc districts data thay đổi
  useEffect(() => {
    if (initialValues && selectedProvinceCode && districts && !loadingDistricts) {
      const districtFound = districts.find(d => d.name === initialValues.district && d.province_code === selectedProvinceCode);
      if (districtFound) {
        setSelectedDistrictCode(districtFound.code);
        form.setFieldsValue({ district: districtFound.code }); // Cập nhật form
      } else {
        setSelectedDistrictCode(undefined);
        form.setFieldsValue({ district: undefined });
      }
    }
  }, [initialValues, selectedProvinceCode, districts, loadingDistricts, form]);

  // ⭐ Effect để load wards và set selectedWardCode ⭐
  // Chạy khi selectedDistrictCode hoặc wards data thay đổi
  useEffect(() => {
    if (initialValues && selectedDistrictCode && wards && !loadingWards) {
      const wardFound = wards.find(w => w.name === initialValues.ward && w.district_code === selectedDistrictCode);
      if (wardFound) {
        setSelectedWardCode(wardFound.code);
        form.setFieldsValue({ ward: wardFound.code }); // Cập nhật form
      } else {
        setSelectedWardCode(undefined);
        form.setFieldsValue({ ward: undefined });
      }
    }
  }, [initialValues, selectedDistrictCode, wards, loadingWards, form]);

  // ⭐ Reset districts và wards khi province thay đổi (do người dùng) ⭐
  // Cờ isUserChangeRef.current sẽ đảm bảo điều này chỉ xảy ra sau khi initial load
  useEffect(() => {
    if (isUserChangeRef.current) {
      form.setFieldsValue({ district: undefined, ward: undefined });
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
    }
  }, [selectedProvinceCode, form]);

  // ⭐ Reset wards khi district thay đổi (do người dùng) ⭐
  useEffect(() => {
    if (isUserChangeRef.current) {
      form.setFieldsValue({ ward: undefined });
      setSelectedWardCode(undefined);
    }
  }, [selectedDistrictCode, form]);

  const onFinish = (values: any) => {
    // Values từ form giờ đây chứa các code (ID) của địa phương
    const finalValues: AddressFormValues = {
      fullName: values.fullName,
      phone: values.phone,
      address: values.address,
      // Tìm tên từ code để gửi lên backend
      province: provinces?.find(p => p.code === values.province)?.name || null,
      district: districts?.find(d => d.code === values.district)?.name || null,
      ward: wards?.find(w => w.code === values.ward)?.name || null,
      isDefault: values.isDefault || false,
    };
    onSave(finalValues);
  };

  const filterSelectOption = (input: string, option: any) => {
    const optionText = option?.children;
    if (typeof optionText === 'string') {
      return optionText.toLowerCase().includes(input.toLowerCase());
    }
    return false;
  };

  return (
    <div className="bg-white p-6 rounded-md shadow-md mt-4">
      <h3 className="text-lg font-semibold mb-4">
        {initialValues ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
      </h3>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label="Số điện thoại"
              name="phone"
              rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
            >
              <Input type="tel" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item
              label="Địa chỉ chi tiết (Số nhà, Tên đường)"
              name="address"
              rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}
            >
              <Input.TextArea rows={3} />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Tỉnh/Thành phố"
              name="province"
              rules={[{ required: true, message: 'Vui lòng chọn Tỉnh/Thành phố' }]}
            >
              <Select
                placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
                loading={loadingProvinces}
                onChange={(value: string) => {
                  isUserChangeRef.current = true; // Đánh dấu đây là thay đổi do người dùng
                  setSelectedProvinceCode(value);
                  form.setFieldsValue({ province: value }); // Cập nhật giá trị vào form
                }}
                showSearch
                filterOption={filterSelectOption}
                allowClear
              >
                {errorProvinces && (
                  <Option disabled value="error_province">
                    <Alert message="Lỗi tải tỉnh" description={provincesError?.message} type="error" showIcon style={{ padding: 4 }} />
                  </Option>
                )}
                {provinces?.map((province: Province) => (
                  <Option key={province.code} value={province.code}>
                    {province.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Quận/Huyện"
              name="district"
              rules={[{ required: true, message: 'Vui lòng chọn Quận/Huyện' }]}
            >
              <Select
                placeholder={loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}
                loading={loadingDistricts}
                onChange={(value: string) => {
                  isUserChangeRef.current = true; // Đánh dấu đây là thay đổi do người dùng
                  setSelectedDistrictCode(value);
                  form.setFieldsValue({ district: value });
                }}
                disabled={!selectedProvinceCode}
                showSearch
                filterOption={filterSelectOption}
                allowClear
              >
                {errorDistricts && (
                  <Option disabled value="error_district">
                    <Alert message="Lỗi tải quận/huyện" description={districtsError?.message} type="error" showIcon style={{ padding: 4 }} />
                  </Option>
                )}
                {districts?.map((district: District) => (
                  <Option key={district.code} value={district.code}>
                    {district.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item
              label="Phường/Xã"
              name="ward"
              rules={[{ required: true, message: 'Vui lòng chọn Phường/Xã' }]}
            >
              <Select
                placeholder={loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
                loading={loadingWards}
                onChange={(value: string) => {
                  isUserChangeRef.current = true; // Đánh dấu đây là thay đổi do người dùng
                  setSelectedWardCode(value);
                  form.setFieldsValue({ ward: value });
                }}
                disabled={!selectedDistrictCode}
                showSearch
                filterOption={filterSelectOption}
                allowClear
              >
                {errorWards && (
                  <Option disabled value="error_ward">
                    <Alert message="Lỗi tải phường/xã" description={wardsError?.message} type="error" showIcon style={{ padding: 4 }} />
                  </Option>
                )}
                {wards?.map((ward: Ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="isDefault" valuePropName="checked">
          <Checkbox>Đặt làm địa chỉ mặc định</Checkbox>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" className="mr-2">
            Lưu địa chỉ
          </Button>
          <Button onClick={onCancel}>Hủy</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewAddressForm;