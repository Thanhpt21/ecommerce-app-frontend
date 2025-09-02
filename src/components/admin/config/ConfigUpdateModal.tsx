// src/components/ConfigUpdateModal.tsx
'use client';

import {
  Modal,
  Form,
  Input,
  Upload,
  message,
  Button,
  Select,
  Spin,
  Alert,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react'; // Import useRef
import { Config } from '@/types/config.type';
import { useProvinces } from '@/hooks/address/useProvinces';
import { useDistricts } from '@/hooks/address/useDistricts';
import { useWards } from '@/hooks/address/useWards';
import { Province, District, Ward } from '@/types/address.type';

const { Option } = Select;

interface ConfigUpdateModalProps {
  open: boolean;
  onClose: () => void;
  config: Config | null;
  onUpdate: (values: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>, logoFile?: File | null) => void;
  isUpdating: boolean;
}

const ConfigUpdateModal = ({ open, onClose, config, onUpdate, isUpdating }: ConfigUpdateModalProps) => {
  const [form] = Form.useForm();
  const [logoFileList, setLogoFileList] = useState<any[]>([]);

  // States để lưu trữ code địa chỉ đã chọn trong modal
  // Chúng ta sẽ dùng các state này để điều khiển Select components
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<string | undefined>(undefined);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<string | undefined>(undefined);
  const [selectedWardCode, setSelectedWardCode] = useState<string | undefined>(undefined);

  // Flags để kiểm soát việc reset dropdown khi dữ liệu config được nạp
  const isInitialLoadRef = useRef(true);

  // Hooks để lấy dữ liệu địa chỉ
  const { data: provinces, isLoading: loadingProvinces, isError: errorProvinces, error: provincesError } = useProvinces();
  const { data: districts, isLoading: loadingDistricts, isError: errorDistricts, error: districtsError } = useDistricts(selectedProvinceCode);
  const { data: wards, isLoading: loadingWards, isError: errorWards, error: wardsError } = useWards(selectedDistrictCode);

  const validateMobile = (_: any, value: string) => {
    if (!value) {
      return Promise.resolve();
    }
    const phoneRegex = /^(0[2-9]\d{8}|[+]84[2-9]\d{8})$/;
    if (!phoneRegex.test(value)) {
      return Promise.reject('Số điện thoại không hợp lệ (ví dụ: 0912345678 hoặc +84912345678)');
    }
    return Promise.resolve();
  };

  // ⭐ useEffect chính để khởi tạo form và state khi modal mở hoặc config thay đổi ⭐
  useEffect(() => {
    if (open && config) {
      // Đặt tất cả các trường vào form
      form.setFieldsValue({
        name: config.name,
        email: config.email,
        mobile: config.mobile,
        address: config.address,
        // Các trường địa chỉ sẽ được set bằng code đã lưu trong config
        pick_province: config.pick_province || undefined,
        pick_district: config.pick_district || undefined,
        pick_ward: config.pick_ward || undefined,
        pick_address: config.pick_address,
        pick_tel: config.pick_tel,
        pick_name: config.pick_name,
        googlemap: config.googlemap,
        facebook: config.facebook,
        zalo: config.zalo,
        instagram: config.instagram,
        tiktok: config.tiktok,
        youtube: config.youtube,
        x: config.x,
        linkedin: config.linkedin,
      });

      // Cập nhật logo
      setLogoFileList(
        config.logo ? [{ uid: '-1-logo', name: 'logo', status: 'done', url: config.logo }] : []
      );

      // Cập nhật các state code để kích hoạt fetch dữ liệu cho dropdowns con
      // và đảm bảo giá trị hiển thị được chọn đúng trong Select
      setSelectedProvinceCode(config.pick_province || undefined);
      setSelectedDistrictCode(config.pick_district || undefined);
      setSelectedWardCode(config.pick_ward || undefined);

      // Reset cờ initialLoad sau khi load xong lần đầu
      isInitialLoadRef.current = false;

    } else if (!open) {
      // Khi modal đóng, reset form và tất cả các state
      form.resetFields();
      setLogoFileList([]);
      setSelectedProvinceCode(undefined);
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
      isInitialLoadRef.current = true; // Reset cờ khi modal đóng
    }
  }, [config, open, form]); // Dependencies: config, open, form

  // ⭐ useEffect để reset quận/huyện và phường/xã khi tỉnh thay đổi ⭐
  // Chỉ reset nếu đây không phải là lần tải ban đầu của config
  useEffect(() => {
    // Check if selectedProvinceCode changed AND it's not the initial load from config
    // We also check if districts are loaded to avoid premature resets
    if (!isInitialLoadRef.current && selectedProvinceCode !== form.getFieldValue('pick_province')) {
      form.setFieldsValue({ pick_district: undefined, pick_ward: undefined });
      setSelectedDistrictCode(undefined);
      setSelectedWardCode(undefined);
    }
  }, [selectedProvinceCode, form]);


  // ⭐ useEffect để reset phường/xã khi quận/huyện thay đổi ⭐
  // Chỉ reset nếu đây không phải là lần tải ban đầu của config
  useEffect(() => {
    // Check if selectedDistrictCode changed AND it's not the initial load from config
    if (!isInitialLoadRef.current && selectedDistrictCode !== form.getFieldValue('pick_district')) {
      form.setFieldsValue({ pick_ward: undefined });
      setSelectedWardCode(undefined);
    }
  }, [selectedDistrictCode, form]);


  const onFinish = async (formValues: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const logoFile = logoFileList?.[0]?.originFileObj;

    const provinceCode = formValues.pick_province;
    const districtCode = formValues.pick_district;
    const wardCode = formValues.pick_ward;

    // Tìm tên tương ứng từ dữ liệu đã fetch
    const provinceName = provinces?.find(p => p.code === provinceCode)?.name;
    const districtName = districts?.find(d => d.code === districtCode)?.name;
    const wardName = wards?.find(w => w.code === wardCode)?.name;

    const valuesToUpdate: Partial<Omit<Config, 'id' | 'createdAt' | 'updatedAt'>> = {
      ...formValues,
      // Ghi đè các trường địa chỉ bằng tên nếu có
      pick_province: provinceName || formValues.pick_province, // Giữ lại code nếu không tìm thấy tên (fallback)
      pick_district: districtName || formValues.pick_district,
      pick_ward: wardName || formValues.pick_ward,
    };

    onUpdate(valuesToUpdate, logoFile);
  };

  const filterSelectOption = (input: string, option: any) => {
    const optionText = option?.children;
    if (typeof optionText === 'string') {
      return (optionText as string).toLowerCase().includes(input.toLowerCase());
    }
    return false;
  };

  return (
    <Modal
      title="Cập nhật cấu hình"
      visible={open} // Ant Design v5 dùng 'open' thay vì 'visible'
      onCancel={onClose}
      footer={null}
      // ⭐ Bỏ destroyOnClose để giữ lại trạng thái của form và các Select khi đóng/mở ⭐
      // destroyOnClose
      width={600}
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tên Website" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên website!' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="Email" name="email" rules={[{ type: 'email', message: 'Email không hợp lệ!' }]}>
          <Input type="email" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="mobile"
          rules={[{ validator: validateMobile }]}
        >
          <Input />
        </Form.Item>
        <Form.Item label="Địa chỉ" name="address">
          <Input />
        </Form.Item>

        ---

        <h3>Thông tin địa chỉ lấy hàng mặc định</h3>
        <Form.Item label="Tên người lấy hàng" name="pick_name">
            <Input placeholder="Tên người lấy hàng" />
        </Form.Item>
        <Form.Item
            label="SĐT lấy hàng"
            name="pick_tel"
            rules={[{ validator: validateMobile }]}
        >
            <Input placeholder="Số điện thoại lấy hàng" />
        </Form.Item>

        <Form.Item label="Tỉnh/Thành phố lấy hàng" name="pick_province" rules={[{ required: true, message: 'Vui lòng chọn tỉnh/thành phố!' }]}>
          <Select
            showSearch
            placeholder={loadingProvinces ? "Đang tải..." : "Chọn Tỉnh/Thành phố"}
            optionFilterProp="children"
            onChange={value => {
              // Khi người dùng chọn, cập nhật selectedProvinceCode để kích hoạt useDistricts
              setSelectedProvinceCode(value as string);
              // Giá trị này sẽ tự động được Form quản lý qua prop 'name'
            }}
            filterOption={filterSelectOption}
            loading={loadingProvinces}
            allowClear
            // Giá trị mặc định của Select sẽ được quản lý bởi Ant Design Form thông qua name='pick_province'
            // và form.setFieldsValue ở useEffect chính
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

        <Form.Item label="Quận/Huyện lấy hàng" name="pick_district" rules={[{ required: true, message: 'Vui lòng chọn quận/huyện!' }]}>
          <Select
            showSearch
            placeholder={loadingDistricts ? "Đang tải..." : "Chọn Quận/Huyện"}
            optionFilterProp="children"
            onChange={value => {
              setSelectedDistrictCode(value as string);
            }}
            filterOption={filterSelectOption}
            loading={loadingDistricts}
            disabled={!selectedProvinceCode}
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

        <Form.Item label="Phường/Xã lấy hàng" name="pick_ward" rules={[{ required: true, message: 'Vui lòng chọn phường/xã!' }]}>
          <Select
            showSearch
            placeholder={loadingWards ? "Đang tải..." : "Chọn Phường/Xã"}
            optionFilterProp="children"
            onChange={value => {
              setSelectedWardCode(value as string);
            }}
            filterOption={filterSelectOption}
            loading={loadingWards}
            disabled={!selectedDistrictCode}
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

        <Form.Item label="Địa chỉ chi tiết lấy hàng" name="pick_address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết!' }]}>
          <Input.TextArea rows={2} placeholder="Số nhà, tên đường, tên tòa nhà..." />
        </Form.Item>

        ---

        <Form.Item label="Google Map" name="googlemap">
          <Input />
        </Form.Item>
        <Form.Item label="Facebook" name="facebook">
          <Input />
        </Form.Item>
        <Form.Item label="Zalo" name="zalo">
          <Input />
        </Form.Item>
        <Form.Item label="Instagram" name="instagram">
          <Input />
        </Form.Item>
        <Form.Item label="Tiktok" name="tiktok">
          <Input />
        </Form.Item>
        <Form.Item label="Youtube" name="youtube">
          <Input />
        </Form.Item>
        <Form.Item label="X (Twitter)" name="x">
          <Input />
        </Form.Item>
        <Form.Item label="LinkedIn" name="linkedin">
          <Input />
        </Form.Item>

        <Form.Item label="Logo">
          <Upload
            listType="picture"
            fileList={logoFileList}
            onChange={({ fileList }) => setLogoFileList(fileList)}
            beforeUpload={() => false}
            maxCount={1}
            accept="image/*"
          >
            <Button icon={<UploadOutlined />}>Chọn Logo</Button>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isUpdating} block>
            Cập nhật
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ConfigUpdateModal;