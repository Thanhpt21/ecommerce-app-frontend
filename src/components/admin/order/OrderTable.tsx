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
} from '@ant-design/icons';
import { useState } from 'react';
import { useOrders } from '@/hooks/order/useOrders';
import { useDeleteOrder } from '@/hooks/order/useDeleteOrder';
import { Order} from '@/types/order/order.type'; // Import OrderStatus và PaymentMethod
import Link from 'next/link';
import OrderDetailModal from './OrderDetailModal';
import { formatVND, formatDate } from '@/utils/helpers';
import { useUpdateOrder } from '@/hooks/order/useUpdateOrder';
import { OrderStatus, PaymentMethod } from '@/enums/order.enums';

export default function OrderTable() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>(undefined); // State cho lọc trạng thái
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<PaymentMethod | undefined>(undefined); // State cho lọc phương thức thanh toán

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | undefined>(undefined);

  const { data, isLoading, refetch } = useOrders({
    page,
    limit: 10,
    search,
    statusFilter, // Truyền bộ lọc trạng thái
    paymentMethodFilter, // Truyền bộ lọc phương thức thanh toán
  });
  const { mutateAsync: deleteOrder, isPending: isDeleting } = useDeleteOrder();
  const { mutateAsync: updateOrderStatus, isPending: isUpdatingStatus } = useUpdateOrder();

  const handleStatusChange = async (value: OrderStatus, record: Order) => {
    try {
      await updateOrderStatus({ id: record.id, status: value });
      message.success(`Cập nhật trạng thái thành công thành: ${value}`);
      // refetch?.(); // InvalidateQueries đã làm điều đó
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
    setPage(1); // Reset về trang 1 khi áp dụng bộ lọc mới
    refetch(); // Gọi refetch để áp dụng bộ lọc
  };

  const columns: ColumnsType<Order & { user?: { email?: string } }> = [

     {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_text, _record, index) => (page - 1) * Number(process.env.NEXT_PUBLIC_PAGE_SIZE) + index + 1,
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
          style={{ width: 120 }}
          onChange={(value) => handleStatusChange(value as OrderStatus, record)}
          loading={isUpdatingStatus}
        >
          <Select.Option value="pending"><Tag color="yellow">Chờ xử lý</Tag></Select.Option>
          <Select.Option value="paid"><Tag color="green">Đã thanh toán</Tag></Select.Option>
          <Select.Option value="shipping"><Tag color="blue">Đang giao hàng</Tag></Select.Option>
          <Select.Option value="completed"><Tag color="geekblue">Đã hoàn thành</Tag></Select.Option>
          <Select.Option value="cancelled"><Tag color="red">Đã hủy</Tag></Select.Option>
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
          <Select
            placeholder="Lọc theo trạng thái"
            style={{ width: 180 }}
            allowClear
            onChange={(value: OrderStatus) => setStatusFilter(value)}
            value={statusFilter}
            onClear={() => setStatusFilter(undefined)}
          >
            <Select.Option value="pending">Chờ xử lý</Select.Option>
            <Select.Option value="paid">Đã thanh toán</Select.Option>
            <Select.Option value="shipping">Đang giao hàng</Select.Option>
            <Select.Option value="completed">Đã hoàn thành</Select.Option>
            <Select.Option value="cancelled">Đã hủy</Select.Option>
          </Select>

          <Select
            placeholder="Lọc theo phương thức TT"
            style={{ width: 200 }}
            allowClear
            onChange={(value: PaymentMethod) => setPaymentMethodFilter(value)}
            value={paymentMethodFilter}
            onClear={() => setPaymentMethodFilter(undefined)}
          >
            <Select.Option value="COD">COD</Select.Option>
            <Select.Option value="VNPay">VNPay</Select.Option>
            <Select.Option value="Momo">Momo</Select.Option>
            {/* Thêm các phương thức thanh toán khác nếu có */}
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