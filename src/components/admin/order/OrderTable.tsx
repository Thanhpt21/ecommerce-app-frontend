'use client';

import {
  Table,
  Tag,
  Space,
  Tooltip,
  Input,
  Button,
  Modal,
  message,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  EyeOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useOrders } from '@/hooks/order/useOrders';
import { useDeleteOrder } from '@/hooks/order/useDeleteOrder';
import { Order } from '@/types/order/order.type';
import OrderDetailModal from './OrderDetailModal';
import { formatVND, formatDate } from '@/utils/helpers';
import { useUpdateOrder } from '@/hooks/order/useUpdateOrder';
import { OrderStatus, PaymentMethod } from '@/enums/order.enums'; // Make sure this path is correct

export default function OrderTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined);
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | undefined>(undefined);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);

  const { data, isLoading, refetch } = useOrders({
    page,
    limit: 10,
    search,
    statusFilter,
    paymentMethodFilter,
  });
  const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const { mutateAsync: updateOrderStatus, isPending: isUpdatingStatus } = useUpdateOrder();

  const handleStatusChange = async (value: OrderStatus, record: Order) => {
    try {
      await updateOrderStatus({ id: record.id, status: value });
      message.success(`Cập nhật trạng thái thành công`);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  const handleDeleteOrder = async (id: number) => {
    try {
      await deleteOrder(id);
      message.success('Xóa đơn hàng thành công');
      refetch?.();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa đơn hàng thất bại');
    }
  };

  const showOrderDetail = (id: number) => {
    setSelectedOrderId(id);
    setIsDetailModalOpen(true);
  };

  const hideOrderDetail = () => {
    setIsDetailModalOpen(false);
    setSelectedOrderId(undefined);
  };

  const handleFilterChange = () => {
    setPage(1);
    refetch();
  };

  const handleCreateGHTKOrder = async (record: Order) => {
    Modal.confirm({
      title: 'Tạo đơn hàng Giao Hàng Tiết Kiệm',
      content: `Bạn có chắc chắn muốn tạo đơn hàng GHTK cho đơn hàng này không?`,
      okText: 'Tạo đơn',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          message.loading('Đang tạo đơn hàng GHTK...');
          console.log('Dữ liệu đơn hàng để gửi lên GHTK:', {
            orderId: record.id,
            orderCode: record.orderCode,
            customerInfo: record.shippingAddress,
            items: record.items.map(item => ({
              name: item.variant?.title || item.product?.title,
              quantity: item.quantity,
              price: item.price,
            })),
            totalAmount: record.finalAmount,
            codAmount: record.paymentMethod === PaymentMethod.COD ? record.finalAmount : 0,
          });

          await new Promise(resolve => setTimeout(resolve, 1500));

          message.destroy();
          message.success('Đã gửi yêu cầu tạo đơn GHTK thành công! Vui lòng kiểm tra console.');
          refetch();
        } catch (error: any) {
          message.destroy();
          message.error(error?.response?.data?.message || 'Tạo đơn GHTK thất bại.');
          console.error("Lỗi khi tạo đơn GHTK:", error);
        }
      },
    });
  };

  const columns: ColumnsType<Order & { user?: { email?: string } }> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE || 10) + index + 1,
    },
    {
      title: 'Email khách hàng',
      dataIndex: ['user', 'email'],
      key: 'email',
      render: (email) => email || '-',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'finalAmount',
      key: 'finalAmount',
      render: (amount: number) => formatVND(amount),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: Order['status'], record: Order) => (
        <Select
          defaultValue={status}
          style={{ width: 140 }}
          onChange={(value) => handleStatusChange(value as OrderStatus, record)}
          loading={isUpdatingStatus}
          disabled={
            status === OrderStatus.Delivered ||
            status === OrderStatus.Cancelled ||
            status === OrderStatus.Returned
          }
        >
          <Select.Option value={OrderStatus.Pending}>
            <Tag color="yellow">Chờ xử lý</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Confirmed}>
            <Tag color="blue">Đã xác nhận</Tag>
          </Select.Option>
           <Select.Option value={OrderStatus.Preparing}>
            <Tag color="orange">Đang chuẩn bị</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Shipped}>
            <Tag color="cyan">Đang giao hàng</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Delivered}>
            <Tag color="purple">Đã giao hàng</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Completed}>
            <Tag color="geekblue">Đã hoàn thành</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Cancelled}>
            <Tag color="red">Đã hủy</Tag>
          </Select.Option>
          <Select.Option value={OrderStatus.Returned}>
            <Tag color="volcano">Đã trả hàng</Tag>
          </Select.Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Xem chi tiết">
            <EyeOutlined onClick={() => showOrderDetail(record.id)} style={{ color: 'green', cursor: 'pointer' }} />
          </Tooltip>
          {record.status === OrderStatus.Confirmed && (
            <Tooltip title="Tạo đơn Giao Hàng Tiết Kiệm">
              <CloudUploadOutlined
                onClick={() => handleCreateGHTKOrder(record)}
                style={{ color: '#ff6600', cursor: 'pointer' }}
              />
            </Tooltip>
          )}
          <Tooltip title="Xóa">
            <DeleteOutlined
              style={{ color: 'red', cursor: 'pointer' }}
              onClick={() => {
                Modal.confirm({
                  title: 'Xác nhận xóa đơn hàng',
                  content: `Bạn có chắc chắn muốn xóa đơn hàng ID ${record.id} không?`,
                  okText: 'Xóa',
                  okType: 'danger',
                  cancelText: 'Hủy',
                  onOk: async () => {
                    await handleDeleteOrder(record.id);
                  },
                });
              }}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const handleSearch = () => {
    setPage(1);
    setSearch(inputValue);
  };

  return (
    <div>
      <div className="flex items-center mb-4">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Tìm kiếm mã đơn hàng, email..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Tìm kiếm
          </Button>
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 180 }}
            allowClear
            onChange={(value: OrderStatus) => setStatusFilter(value)}
            value={statusFilter}
          >
            {Object.values(OrderStatus).map((statusValue) => (
              <Select.Option key={statusValue} value={statusValue}>
                {
                  statusValue === OrderStatus.Pending ? 'Chờ xử lý' :
                  statusValue === OrderStatus.Confirmed ? 'Đã xác nhận' :
                  statusValue === OrderStatus.Shipped ? 'Đang giao hàng' :
                  statusValue === OrderStatus.Delivered ? 'Đã giao hàng' :
                  statusValue === OrderStatus.Completed ? 'Đã hoàn thành' :
                  statusValue === OrderStatus.Cancelled ? 'Đã hủy' :
                  statusValue === OrderStatus.Returned ? 'Đã trả hàng' :
                  statusValue
                }
              </Select.Option>
            ))}
          </Select>

          <Select
            placeholder="Lọc theo phương thức TT"
            style={{ width: 200 }}
            allowClear
            onChange={(value: PaymentMethod) => setPaymentMethodFilter(value)}
            value={paymentMethodFilter}
          >
            <Select.Option value={PaymentMethod.COD}>COD</Select.Option>
            <Select.Option value={PaymentMethod.Bank}>Bank</Select.Option>
            <Select.Option value={PaymentMethod.Momo}>Momo</Select.Option>
          </Select>

          <Button type="primary" onClick={handleFilterChange}>
            Lọc
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={data?.data || []}
        rowKey="id"
        loading={isLoading}
        pagination={{
          total: data?.total,
          current: page,
          pageSize: 10,
          onChange: (p) => setPage(p),
        }}
      />

      <OrderDetailModal
        open={isDetailModalOpen}
        onClose={hideOrderDetail}
        orderId={selectedOrderId}
      />
    </div>
  );
}