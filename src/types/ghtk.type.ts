// src/types/ghtk.type.ts

/**
 * @interface CalculateFeeDto
 * @description DTO (Data Transfer Object) cho request tính phí vận chuyển GHTK.
 * Đảm bảo các trường này khớp với DTO ở backend của bạn.
 */
export interface CalculateFeeDto {
  pick_province: string;
  pick_district: string;
  pick_ward?: string | null; // Có thể null nếu không bắt buộc
  pick_address?: string | null; // Có thể null nếu không bắt buộc
  province: string;
  district: string;
  ward?: string | null; // Có thể null nếu không bắt buộc
  address?: string | null; // Có thể null nếu không bắt buộc
  weight: number; // Trọng lượng gói hàng (gram)
  value?: number; // Giá trị đơn hàng (VNĐ), tùy chọn, mặc định 0
  deliver_option?: 'none' | 'xteam'; // 'xteam' cho giao hàng nhanh, 'none' cho tiêu chuẩn
  transport?: 'road' | 'fly'; // 'road' cho đường bộ, 'fly' cho đường bay
}

// --- Các interface bạn đã cung cấp ---

/**
 * @interface GHTKRawFeeContent
 * @description Chi tiết phí vận chuyển thực tế bên trong đối tượng 'fee' thứ hai từ GHTK.
 */
export interface GHTKRawFeeContent {
  name: string;
  fee: number; // Tổng phí vận chuyển
  insurance_fee: number; // Phí bảo hiểm (nếu có)
  include_vat: number; // Có bao gồm VAT không (0 hoặc 1)
  cost_id: number;
  delivery_type: string;
  a: number;
  dt: string; // Loại khu vực (local, inter, ...)
  extFees: any[]; // Mảng các phí mở rộng
  promotion_key: string;
  delivery: boolean;
  ship_fee_only: number; // Phí ship cơ bản
  distance: number;
  options: {
    name: string;
    title: string;
    shipMoney: number;
    shipMoneyText: string;
    vatText: string;
    desc: string;
    coupon: string;
    maxUses: number;
    maxDates: number;
    maxDateString: string;
    content: string;
    activatedDate: string;
    couponTitle: string;
    discount: string;
    couponId: number;
  };
  // Nếu có các trường như pick_money_fee, coupon_amount, r_fee, hãy thêm vào đây
  // pick_money_fee?: number;
  // coupon_amount?: number;
  // r_fee?: number;
}

/**
 * @interface GHTKInternalFeeResponse
 * @description Cấu trúc phản hồi 'fee' cấp 1 từ GHTK.
 * Đây là đối tượng lồng bên trong phản hồi GHTK chính.
 */
export interface GHTKInternalFeeResponse {
  success: boolean;
  message?: string;
  fee?: GHTKRawFeeContent; // Đối tượng chứa chi tiết phí thực tế
}

/**
 * @interface GHTKRawFeeResponse
 * @description Cấu trúc phản hồi RAW (thô) từ API tính phí GHTK.
 * Đây là cấu trúc mà backend của bạn sẽ nhận được trực tiếp từ GHTK.
 * Và cũng là cấu trúc mà backend đang TRẢ VỀ cho frontend theo mô tả của bạn.
 */
export interface GHTKRawFeeResponse {
  success: boolean;
  message?: string;
  fee?: GHTKInternalFeeResponse; // Đối tượng 'fee' lồng bên trong
  reason?: string;
}

// --- Interface cho phản hồi ĐÃ LÀM PHẲNG của backend gửi về frontend ---
// (Chỉ dùng nếu backend đã "làm phẳng" dữ liệu trước khi gửi về frontend)

/**
 * @interface GHTKFeeDetails
 * @description Chi tiết phí vận chuyển đã được làm phẳng, gửi về frontend.
 * Nếu backend của bạn đã xử lý và làm phẳng dữ liệu trước khi gửi đi,
 * thì frontend sẽ mong đợi cấu trúc này cho trường 'fee' của GHTKShipFeeResponse.
 */
export interface GHTKFeeDetails {
  name: string;
  fee: number; // Tổng phí vận chuyển (đã làm phẳng)
  insurance_fee: number; // Phí bảo hiểm (nếu có)
  extra_fee: { // Đối tượng chi tiết các khoản phí bổ sung.
    pickup_fee: number; // Phí lấy hàng (pickup).
    return_fee: number; // Phí hoàn hàng (return), nếu việc giao hàng không thành công.
  };
  // Thêm các trường khác từ GHTKRawFeeContent vào đây nếu bạn muốn làm phẳng chúng
  // ví dụ: include_vat?: number; cost_id?: number; ...
}

/**
 * @interface GHTKShipFeeResponse
 * @description Cấu trúc phản hồi từ API tính phí GHTK của backend (đã làm phẳng).
 * Đây là cấu trúc frontend sẽ nhận được NẾU backend đã xử lý và làm phẳng dữ liệu.
 * Dựa trên mô tả của bạn, hiện tại backend đang trả về GHTKRawFeeResponse.
 */
export interface GHTKShipFeeResponse {
  success: boolean;
  message?: string;
  fee?: GHTKFeeDetails; // Chi tiết phí, chỉ có nếu success là true
  reason?: string; // Tin nhắn tùy chọn cung cấp lý do thất bại, nếu 'success' là false.
}

// --- Các interface khác (giữ nguyên hoặc đã được chỉnh sửa nhỏ) ---

export interface GHTKCreateOrderResponse {
  success: boolean; // Cho biết việc tạo đơn hàng có thành công hay không.
  message?: string; // Tin nhắn tùy chọn, thường dùng cho phản hồi thành công.
  order?: { // Đối tượng tùy chọn chứa thông tin chi tiết của đơn hàng đã tạo.
    partner_id: string; // Mã ID duy nhất của đơn hàng từ hệ thống của bạn.
    label: string; // Mã vận đơn hoặc mã theo dõi của GHTK cho đơn hàng.
    area: string; // Khu vực địa lý hoặc vùng dịch vụ của đơn hàng.
    fee: number; // Phí vận chuyển đã tính cho đơn hàng cụ thể này.
    insurance_fee: number; // Phí bảo hiểm áp dụng cho đơn hàng này.
    created: string; // Thời gian (timestamp) cho biết khi nào đơn hàng được tạo.
    status?: string;        // The status of the order from GHTK (e.g., 'picking', 'accepted')
    tracking_link?: string; // The URL to track the order on GHTK's website
  };
  reason?: string; // Tin nhắn tùy chọn cung cấp lý do thất bại, nếu 'success' là false.
}

export interface GHTKProvinceResponse {
  success: boolean; // Cho biết yêu cầu lấy danh sách tỉnh/thành phố có thành công hay không.
  message?: string;
  data: { // Một mảng các đối tượng, mỗi đối tượng đại diện cho một tỉnh/thành phố.
    ProvinceID: number; // ID số duy nhất của tỉnh/thành phố.
    ProvinceName: string; // Tên của tỉnh/thành phố.
  }[];
}

export interface GHTKDistrictResponse {
  success: boolean; // Cho biết yêu cầu lấy danh sách quận/huyện có thành công hay không.
  message?: string;
  data: { // Một mảng các đối tượng, mỗi đối tượng đại diện cho một quận/huyện.
    DistrictID: number; // ID số duy nhất của quận/huyện.
    DistrictName: string; // Tên của quận/huyện.
    ProvinceID: number; // ID của tỉnh/thành phố mà quận/huyện này thuộc về.
  }[];
}

export interface GHTKWardResponse {
  success: boolean; // Cho biết yêu cầu lấy danh sách phường/xã có thành công hay không.
  message?: string;
  data: { // Một mảng các đối tượng, mỗi đối tượng đại diện cho một phường/xã.
    WardID: number; // ID số duy nhất của phường/xã.
    WardName: string; // Tên của phường/xã.
    DistrictID: number; // ID của quận/huyện mà phường/xã này thuộc về.
  }[];
}

export interface GHTKTrackingResponse {
  success: boolean; // Cho biết yêu cầu có thành công hay không.
  message?: string; // Tin nhắn tùy chọn.
  order?: { // Đối tượng chứa thông tin chi tiết về trạng thái đơn hàng.
    label: string; // Mã vận đơn của GHTK.
    partner_id: string; // Mã ID đơn hàng từ hệ thống của bạn.
    status: number; // Mã trạng thái của đơn hàng (ví dụ: 1: Đang lấy hàng, 2: Đang giao hàng, -1: Đã hủy).
    status_text: string; // Mô tả trạng thái bằng văn bản.
    // Các trường khác có thể có tùy thuộc vào GHTK, ví dụ:
    // tracking_id: string;
    // created_at: string;
    // deliver_date: string;
    // receiver_name: string;
    // receiver_address: string;
    // events: { event_time: string; status: string; address: string; }[]; // Lịch sử các sự kiện
  };
  reason?: string; // Lý do thất bại nếu success là false.
}

export interface GHTKCancelOrderResponse {
  success: boolean; // Cho biết yêu cầu hủy đơn hàng có thành công hay không.
  message?: string; // Tin nhắn phản hồi (ví dụ: "Hủy đơn hàng thành công").
  reason?: string; // Lý do thất bại nếu success là false.
}