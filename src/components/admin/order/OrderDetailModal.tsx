// src/components/admin/order/OrderDetailModal.tsx
'use client';

import { Modal, Typography, Descriptions, Table, Image } from 'antd';
import { Order } from '@/types/order/order.type';
import { useOrderOne } from '@/hooks/order/useOrderOne';
import { formatDate } from '@/utils/helpers';
import { getPaymentMethodVietnamese } from '@/utils/translation';


interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  orderId?: number;
}

const { Title } = Typography;

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ open, onClose, orderId }) => {
  const { data: order, isLoading, isError, error } = useOrderOne(orderId);

  if (isLoading) {
    return <Modal visible={open} title="Chi tiết đơn hàng" onCancel={onClose} footer={null}>Đang tải...</Modal>;
  }

  if (isError) {
    console.error("Lỗi khi tải chi tiết đơn hàng:", error);
    return (
      <Modal visible={open} title="Chi tiết đơn hàng" onCancel={onClose} footer={null}>
        Đã xảy ra lỗi khi tải chi tiết đơn hàng.
      </Modal>
    );
  }

  if (!order) {
    return null;
  }


  return (
    <Modal
      visible={open}
      title={`Chi tiết đơn hàng #${order.id}`}
      onCancel={onClose}
      footer={null}
      width={1200} // Tăng chiều rộng modal
    >
      <Descriptions bordered>
        <Descriptions.Item label="Mã đơn hàng">{order.orderCode}</Descriptions.Item>
        <Descriptions.Item label="Khách hàng (Email)">{order.user.email}</Descriptions.Item>
    
        <Descriptions.Item label="Phương thức thanh toán">  {getPaymentMethodVietnamese(order.paymentMethod)}</Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">
          {formatDate((order.createdAt))}
        </Descriptions.Item>
          {order.shippingFee !== undefined && order.shippingFee !== null && (
          <Descriptions.Item label="Phí vận chuyển">
            {order.shippingFee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Descriptions.Item>
        )}
      
        {order.cancelReason && (
          <Descriptions.Item label="Lý do hủy" span={3}>
            {order.cancelReason}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Ghi chú" span={3}>
          {order.note || 'Không có'}
        </Descriptions.Item>
        {order.shippingAddress && (
          <Descriptions.Item label="Địa chỉ giao hàng" span={3}>
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.phone}<br />
            {`${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
          </Descriptions.Item>
        )}
        {order.coupon && (
          <>
            <Descriptions.Item label="Mã giảm giá">{order.coupon.code}</Descriptions.Item>
            <Descriptions.Item label="Giảm giá coupon">
              {order.coupon.discount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="Tổng tiền" span={2}>
          {order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Descriptions.Item>
      </Descriptions>

      <Title level={4} style={{ marginTop: 16 }}>Sản phẩm trong đơn hàng</Title>
      <Table
        dataSource={order.items}
        rowKey="id"
        pagination={false}
        columns={[
        {
            title: 'Hình ảnh',
            dataIndex: 'variant',
            key: 'image',
            render: (variant, item) => {
                const imageUrl = variant?.thumb || item.product?.thumb;
                const altText = variant?.title || item.product?.title || 'Sản phẩm';
                return imageUrl ? (
                <Image src={imageUrl} alt={altText} width={50} height={50} />
                ) : (
                'Không có ảnh'
                );
            },
            },
         {
            title: 'Sản phẩm',
            render: (item) => (
                <span>
                {item.variant?.title || item.product?.title || 'N/A'}
                {item.variant?.color?.title
                    ? ` - Màu: ${item.variant.color.title}`
                    : item.product?.color?.title
                    ? ` - Màu: ${item.product.color.title}`
                    : ''}
                {item.size?.title && ` - Size: ${item.size?.title || 'N/A'}`}
                </span>
            ),
            key: 'product',
            },
          {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
          },
            {
            title: 'Giá', // Tên cột vẫn là 'Giá'
            key: 'price_after_discount', // Đổi key để tránh trùng lặp nếu có
            render: (text, item) => {
              // Tính giá sau giảm giá
              const price = item.price ?? 0; // Đảm bảo có giá trị số
              const discount = item.discount ?? 0; // Đảm bảo có giá trị số
              const finalItemPrice = price - discount;

              return (
                <span>
                  {finalItemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  {/* Tùy chọn: Hiển thị giá gốc gạch ngang nếu có giảm giá */}
                  {/* {discount > 0 && (
                    <span className="ml-2 text-gray-500 line-through text-sm">
                      {price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </span>
                  )} */}
                </span>
              );
            },
          },
        ]}
      />

    </Modal>
  );
};

export default OrderDetailModal;