// src/components/AddressSelector.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Select, Spin, Alert, Form } from 'antd'; // Thêm Form để quản lý trạng thái form tốt hơn
import { useProvinces } from '@/hooks/address/useProvinces';
import { useDistricts } from '@/hooks/address/useDistricts';
import { useWards } from '@/hooks/address/useWards';

const { Option } = Select;

const AddressSelector = () => {
  const [form] = Form.useForm(); // Sử dụng Ant Design Form

  // States để lưu trữ code đã chọn
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>(undefined);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>(undefined);
  const [selectedWardCode, setSelectedWardCode] = useState<string | undefined>(undefined);

  // Hooks để lấy dữ liệu
  const { data: provinces, isLoading: loadingProvinces, isError: errorProvinces, error: provincesError } = useProvinces();
  const { data: districts, isLoading: loadingDistricts, isError: errorDistricts, error: districtsError } = useDistricts(selectedProvinceCode);
  const { data: wards, isLoading: loadingWards, isError: errorWards, error: wardsError } = useWards(selectedDistrictCode);

  // Reset quận/huyện và phường/xã khi tỉnh thay đổi
  useEffect(() => {
    form.setFieldsValue({ district: undefined, ward: undefined });
    setSelectedDistrictCode(undefined);
    setSelectedWardCode(undefined);
  }, [selectedProvinceCode, form]);

  // Reset phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    form.setFieldsValue({ ward: undefined });
    setSelectedWardCode(undefined);
  }, [selectedDistrictCode, form]);

  // Hàm chung để lọc option
  const filterSelectOption = (input: string, option: any) => {
    const optionText = option?.children;
    if (typeof optionText === 'string') {
      return (optionText as string).toLowerCase().includes(input.toLowerCase());
    }
    return false;
  };

  // Hàm xử lý khi chọn tỉnh
  const handleProvinceChange = (value: string) => {
    setSelectedProvinceCode(value);
  };

  // Hàm xử lý khi chọn quận/huyện
  const handleDistrictChange = (value: string) => {
    setSelectedDistrictCode(value);
  };

  // Hàm xử lý khi chọn phường/xã
  const handleWardChange = (value: string) => {
    setSelectedWardCode(value);
  };

  // Render lỗi chung nếu có lỗi khi tải tỉnh (lỗi ở cấp cao nhất)
  if (errorProvinces) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={`Không thể tải danh sách tỉnh/thành phố: ${provincesError?.message || 'Lỗi không xác định'}`}
        type="error"
        showIcon
      />
    );
  }

  return (
    <Form form={form} layout="vertical">
      <h2 style={{ marginBottom: 20 }}>Chọn Địa chỉ</h2>

      {/* Chọn Tỉnh/Thành phố */}
      <Form.Item label="Tỉnh/Thành phố" name="province">
        <Select
          showSearch
          placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
          optionFilterProp="children"
          onChange={handleProvinceChange}
          filterOption={filterSelectOption}
          loading={loadingProvinces} // Hiển thị loading spinner trong select
          allowClear // Cho phép xóa lựa chọn
        >
          {provinces?.map((province) => (
            <Option key={province.code} value={province.code}>
              {province.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Chọn Quận/Huyện */}
      <Form.Item label="Quận/Huyện" name="district">
        <Select
          showSearch
          placeholder={loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}
          optionFilterProp="children"
          onChange={handleDistrictChange}
          filterOption={filterSelectOption}
          loading={loadingDistricts}
          disabled={!selectedProvinceCode} // Disable nếu chưa chọn tỉnh
          allowClear
        >
          {errorDistricts && ( // Hiển thị lỗi riêng cho district
            <Option disabled>Lỗi: {districtsError?.message}</Option>
          )}
          {districts?.map((district) => (
            <Option key={district.code} value={district.code}>
              {district.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Chọn Phường/Xã */}
      <Form.Item label="Phường/Xã" name="ward">
        <Select
          showSearch
          placeholder={loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
          optionFilterProp="children"
          onChange={handleWardChange}
          filterOption={filterSelectOption}
          loading={loadingWards}
          disabled={!selectedDistrictCode} // Disable nếu chưa chọn quận/huyện
          allowClear
        >
          {errorWards && ( // Hiển thị lỗi riêng cho ward
            <Option disabled>Lỗi: {wardsError?.message}</Option>
          )}
          {wards?.map((ward) => (
            <Option key={ward.code} value={ward.code}>
              {ward.name}
            </Option>
          ))}
        </Select>
      </Form.Item>

      {/* Hiển thị kết quả đã chọn (tùy chọn) */}
      <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '5px' }}>
        <h4>Địa chỉ đã chọn:</h4>
        <p>Tỉnh/Thành: {provinces?.find(p => p.code === selectedProvinceCode)?.name || 'Chưa chọn'}</p>
        <p>Quận/Huyện: {districts?.find(d => d.code === selectedDistrictCode)?.name || 'Chưa chọn'}</p>
        <p>Phường/Xã: {wards?.find(w => w.code === selectedWardCode)?.name || 'Chưa chọn'}</p>
      </div>
    </Form>
  );
};

export default AddressSelector;