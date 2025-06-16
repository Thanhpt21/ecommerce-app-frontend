'use client';

import VariantTable from '@/components/admin/variant/VariantTable';
import { useProductOne } from '@/hooks/product/useProductOne';
import { Typography, Breadcrumb } from 'antd';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const { Title } = Typography;

export default function AdminVariantPage() {
    const { productId: routeProductId } = useParams();
    const productId: string | number = typeof routeProductId === 'string' ? routeProductId : '';
    const { data: product, isLoading, isError } = useProductOne(productId);
    const searchParams = useSearchParams();
    const router = useRouter();
    const [productName, setProductName] = useState<string | undefined>('');
    const previousPage = searchParams.get('page');

    useEffect(() => {
        if (product?.title) {
            setProductName(product.title);
        }
    }, [product]);

    const handleBackToProduct = () => {
        const backUrl = previousPage ? `/vi/admin/product?page=${previousPage}` : '/vi/admin/product';
        router.push(backUrl);
    };

    if (isLoading) {
        return <div>Đang tải thông tin sản phẩm...</div>;
    }

    if (isError) {
        return <div>Lỗi khi tải thông tin sản phẩm.</div>;
    }

    return (
        <div className="p-4">
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item onClick={handleBackToProduct} className='cursor-pointer'>
                    Sản phẩm
                </Breadcrumb.Item>
                {productName && (
                    <Breadcrumb.Item onClick={handleBackToProduct} className='cursor-pointer'>
                        {productName}
                    </Breadcrumb.Item>
                )}
                <Breadcrumb.Item>Biến thể</Breadcrumb.Item>
            </Breadcrumb>
        
            {productId && <VariantTable productId={productId} />}
        </div>
    );
}