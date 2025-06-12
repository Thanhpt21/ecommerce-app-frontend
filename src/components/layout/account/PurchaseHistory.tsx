'use client';

import { Modal, Typography, Descriptions, Table, Image, Button, List } from 'antd';
import { Order } from '@/types/order/order.type';
import { useState } from 'react';
import { formatDate } from '@/utils/helpers';
import { useTranslation } from 'react-i18next';
import { useCurrent } from '@/hooks/auth/useCurrent';
import { useOrdersByUser } from '@/hooks/order/useOrdersByUser';

interface OrderDetailViewProps {
  order: Order;
}

const { Title } = Typography;

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order }) => {
  const { t } = useTranslation('account');
  console.log('order in OrderDetailView:', order);

  return (
    <div className="border rounded-md p-4 mt-4">
      <Title level={5} className="mb-2">{t('order_id')}: #{order.id}</Title>
      <Descriptions bordered size="small">
        <Descriptions.Item label={t('status')}>{t(`order_status_${order.status.toLowerCase()}`)}</Descriptions.Item>
        <Descriptions.Item label={t('payment_method')}>{order.paymentMethod}</Descriptions.Item>
        <Descriptions.Item label={t('order_placed')}>{formatDate(order.createdAt)}</Descriptions.Item>
      
        {order.shippingAddress && (
          <Descriptions.Item label={t('shipping_address')} span={3}>
            {order.shippingAddress.fullName}<br />
            {order.shippingAddress.phone}<br />
            {`${order.shippingAddress.address}, ${order.shippingAddress.ward}, ${order.shippingAddress.district}, ${order.shippingAddress.province}`}
          </Descriptions.Item>
        )}
        {order.coupon && (
          <>
            <Descriptions.Item label={t('coupon_code')}>{order.coupon.code}</Descriptions.Item>
            <Descriptions.Item label={t('coupon_discount')}>
              {order.coupon.discount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </Descriptions.Item>
          </>
        )}
        {order.shipping && (
          <Descriptions.Item label={t('shipping_fee')}>
            {order.shipping.fee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Descriptions.Item>
        )}
         {order.shippingFee !== undefined && order.shippingFee !== null && (
          <Descriptions.Item label={t('shipping_fee')}>
            {order.shippingFee?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
          </Descriptions.Item>
        )}
        <Descriptions.Item label={t('note')} span={3}>{order.note || t('no_note')}</Descriptions.Item>
          <Descriptions.Item label={t('total_amount')}>
          {order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ marginTop: 16 }}>{t('order_items')}</Title>
      <Table
        dataSource={order.items}
        rowKey="id"
        pagination={false}
        columns={[
          {
            title: t('image'),
            dataIndex: 'variant',
            key: 'image',
            render: (variant, item) => {
              const imageUrl = variant?.thumb || item.product?.thumb || '/images/no-image.png';
              const altText = variant?.title || item.product?.title || t('product');
              return <Image src={imageUrl} alt={altText} width={50} height={50} />;
            },
          },
          {
            title: t('product'),
            render: (item) => (
              <span>
                {item.variant?.title || item.product?.title || 'N/A'}
                {item.variant?.color?.title
                  ? ` - ${t('color')}: ${item.variant.color.title}`
                  : item.product?.color?.title
                    ? ` - ${t('color')}: ${item.product.color.title}`
                    : ''}
                {item.size?.title && ` - ${t('size')}: ${item.size.title || 'N/A'}`}
              </span>
            ),
            key: 'product',
          },
          {
            title: t('quantity'),
            dataIndex: 'quantity',
            key: 'quantity',
          },
          {
            title: t('price'),
            dataIndex: 'price',
            key: 'price',
            render: (price) => price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
          },
          {
            title: t('discount'),
            dataIndex: 'discount',
            key: 'discount',
            render: (discount) => discount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }),
          },
        ]}
      />
    </div>
  );
};

interface PurchaseHistoryProps {
  // Có thể có props nào đó nếu cần
}

const PurchaseHistory: React.FC<PurchaseHistoryProps> = () => {
  const { t } = useTranslation('account');
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
    return <div>{t('loading')}...</div>;
  }

  if (isError) {
    return <div>{t('error_loading_orders')}: {error?.message}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-md shadow-md">
      <h2 className="text-xl font-semibold mb-4">{t('purchase_history')}</h2>
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
                  {t('view_details')}
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={<div className="font-semibold">{t('order_id')}: {order.id}</div>}
                description={`${t('order_placed')} ${formatDate(order.createdAt)} - ${t(`order_status_${order.status.toLowerCase()}`)} - ${order.finalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`}
              />
              {order.items.slice(0, 3).map((item) => ( // Hiển thị tối đa 3 sản phẩm tóm tắt
                <div key={item.id} className="flex items-center mt-2">
                  <div className="w-12 h-12 rounded-md overflow-hidden shadow-sm">
                    <Image
                      src={item.variant?.thumb || item.product?.thumb || '/images/no-image.png'}
                      alt={item.product?.title || item.variant?.title || 'Product'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="ml-2 text-sm">
                    {item.product?.title || item.variant?.title || 'Product'}
                  </div>
                </div>
              ))}
            </List.Item>
          )}
        />
      ) : (
        <p>{t('no_orders_yet')}</p>
      )}

      {selectedOrder && (
        <Modal
          visible={isModalOpen}
          title={`${t('order_details')}`}
          onCancel={handleCloseModal}
          footer={[
            <Button key="back" onClick={handleCloseModal}>
              {t('close')}
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