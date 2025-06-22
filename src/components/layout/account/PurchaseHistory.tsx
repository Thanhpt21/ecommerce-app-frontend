'use client';

import { Modal, Typography, Descriptions, Table, Image, Button, List } from 'antd';
import { Order } from '@/types/order/order.type';
import { useState } from 'react';
import { formatDate } from '@/utils/helpers';
import { useCurrent } from '@/hooks/auth/useCurrent';
import { useOrdersByUser } from '@/hooks/order/useOrdersByUser';
import { getPaymentMethodVietnamese } from '@/utils/translation';

interface OrderDetailViewProps {
  order: Order;
}

const { Title } = Typography;

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order }) => {
  console.log('order in OrderDetailView:', order);

  return (
    <div className="border rounded-md p-4 mt-4">
      <Title level={5} className="mb-2">Mã Đơn hàng: {order.orderCode}</Title>
      <Descriptions bordered size="small">
        <Descriptions.Item label="Trạng thái">
          {order.status === 'pending' && 'Đang chờ xử lý'}
          {order.status === 'confirmed' && 'Đã xác nhận'}
          {order.status === 'preparing' && 'Người bán đang chuẩn bị hàng'} {/* ⭐ Added this line ⭐ */}
          {order.status === 'shipped' && 'Đang giao hàng'}
          {order.status === 'delivered' && 'Đã giao hàng'}
          {order.status === 'cancelled' && 'Đã hủy'}
          {order.status === 'returned' && 'Đã trả hàng'}
          {/* Fallback for any unhandled status, though ideally all should be covered */}
          {!['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled', 'returned'].includes(order.status) && order.status}
        </Descriptions.Item>
          <Descriptions.Item label="Phương thức thanh toán"> {getPaymentMethodVietnamese(order.paymentMethod)}</Descriptions.Item>
        <Descriptions.Item label="Ngày đặt hàng">{formatDate(order.createdAt)}</Descriptions.Item>
      
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
            <Descriptions.Item label="Chiết khấu mã giảm giá">
              {order.coupon.discount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Descriptions.Item>
          </>
        )}
        {order.shippingFee !== undefined && order.shippingFee !== null && (
          <Descriptions.Item label="Phí vận chuyển">
            {order.shippingFee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Ghi chú" span={3}>{order.note || 'Không có ghi chú'}</Descriptions.Item>
        <Descriptions.Item label="Tổng số tiền">
          {order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: 16 }}>Sản phẩm trong đơn hàng</Title>
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
              const imageUrl = variant?.thumb || item.product?.thumb || '/images/no-image.png';
              const altText = variant?.title || item.product?.title || 'Sản phẩm';
              return <Image src={imageUrl} alt={altText} width={50} height={50} />;
            },
          },
          {
            title: 'Sản phẩm',
            render: (item) => (
              <span>
                {item.variant?.title || item.product?.title || 'N/A'}
                {item.variant?.color?.title
                  ? ` - Màu sắc: ${item.variant.color.title}`
                  : item.product?.color?.title
                    ? ` - Màu sắc: ${item.product.color.title}`
                    : ''}
                {item.size?.title && ` - Kích thước: ${item.size.title || 'N/A'}`}
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
            title: 'Giá',
            key: 'price_after_discount',
            render: (text, item) => {
              const price = item.price ?? 0;
              const discount = item.discount ?? 0;
              const finalItemPrice = price - discount;

              return (
                <span>
                  {finalItemPrice.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              );
            },
          },
        ]}
      />
    </div>
  );
};

interface PurchaseHistoryProps {
  // Props nếu cần
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = () => {
  const { data: currentUser } = useCurrent();
  const userId = currentUser?.id;
  const { data: ordersData, isLoading, isError, error } = useOrdersByUser({ userId });
  const orders = ordersData?.data;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  if (isError) {
    return <div>Lỗi khi tải đơn hàng: {error?.message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lịch sử mua hàng</h2>
      {orders && orders.length > 0 ? (
        <List
          itemLayout="vertical"
          dataSource={orders}
          renderItem={(order: Order) => (
            <List.Item
              key={order.id}
              className="mb-4 p-4"
              actions={[
                <Button type="link" onClick={() => showOrderDetails(order)}>
                  Xem chi tiết
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<div className="font-semibold">Mã Đơn hàng: {order.orderCode}</div>}
                description={
                  `Ngày đặt hàng ${formatDate(order.createdAt)} - ${
                    order.status === 'pending' ? 'Đang chờ xử lý' :
                    order.status === 'confirmed' ? 'Đã xác nhận' :
                    order.status === 'preparing' ? 'Người bán đang chuẩn bị hàng' : // ⭐ Added this line ⭐
                    order.status === 'shipped' ? 'Đang giao hàng' :
                    order.status === 'delivered' ? 'Đã giao hàng' :
                    order.status === 'cancelled' ? 'Đã hủy' :
                    order.status === 'returned' ? 'Đã trả hàng' :
                    order.status // Fallback if status is not covered
                  } - ${order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`
                }
              />
              {order.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center mt-2">
                  <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm">
                    <Image
                      src={item.variant?.thumb || item.product?.thumb || '/images/no-image.png'}
                      alt={item.product?.title || item.variant?.title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    {item.product?.title || item.variant?.title || 'Sản phẩm'}
                  </div>
                </div>
              ))}
            </List.Item>
          )}
        />
      ) : (
        <p>Chưa có đơn hàng nào.</p>
      )}

      {selectedOrder && (
        <Modal
          visible={isModalOpen} // Use 'open' instead of 'visible' for Ant Design v5+
          title="Chi tiết đơn hàng"
          onCancel={handleCloseModal}
          footer={[
            <Button key="back" onClick={handleCloseModal}>
              Đóng
            </Button>,
          ]}
          width={1000}
        >
          <OrderDetailView order={selectedOrder} />
        </Modal>
      )}
    </div>
  );
};

export default PurchaseHistory;