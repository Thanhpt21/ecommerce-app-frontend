'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, Button, Typography, Space, Input, Rate, Form, Avatar, message } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { TFunction } from 'i18next';
import Link from 'next/link'; // Import Link
import { usePathname } from 'next/navigation';

import { Rating } from '@/types/product.type';
import { useUpdateRating } from '@/hooks/rating/useUpdateRating';
import { useCreateRating } from '@/hooks/rating/useCreateRating';
import { useRatings } from '@/hooks/rating/useRatings';
import { useAuth } from '@/context/AuthContext';
import { useLocaleContext } from '@/context/LocaleContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

interface RatingComponentProps {
  productId: number;
  t: TFunction;
}

export default function RatingComponent({ productId, t }: RatingComponentProps) {
  const [form] = Form.useForm();
  const { currentUser, isLoading: isLoadingAuth } = useAuth();
  const currentUserId = currentUser?.id;
  const pathname = usePathname(); // Lấy đường dẫn hiện tại
  const { locale } = useLocaleContext(); // Lấy locale hiện tại
  const messageShownRef = useRef(false);

  const {
    data: ratingsData,
    isLoading: isLoadingRatings,
    isError: isErrorRatings,
    error: ratingsError,
    refetch: refetchRatings
  } = useRatings({ productId, enabled: !!productId && !isLoadingAuth && currentUserId !== undefined });

  const {
    mutate: createRating,
    isPending: isCreatingRating,
    isSuccess: isCreateSuccess,
    error: createError
  } = useCreateRating();

  const {
    mutate: updateRating,
    isPending: isUpdatingRating,
    isSuccess: isUpdateSuccess,
    error: updateError
  } = useUpdateRating();

  const [userExistingRating, setUserExistingRating] = useState<Rating | null>(null);

  useEffect(() => {
    if (ratingsData?.data && currentUserId !== undefined) {
      const existingRating = ratingsData.data.find(
        (rating) => rating.postedBy?.id === currentUserId
      );
      setUserExistingRating(existingRating || null);

      if (existingRating) {
        form.setFieldsValue({
          rating: existingRating.star,
          comment: existingRating.comment,
        });
      } else {
        form.resetFields();
      }
    } else if (currentUserId === undefined && !isLoadingAuth) {
      form.resetFields();
      setUserExistingRating(null);
    }
  }, [ratingsData, productId, currentUserId, form, isLoadingAuth]);

  useEffect(() => {
    if ((isCreateSuccess || isUpdateSuccess) && !messageShownRef.current) {
      message.success(t('review_submitted_successfully'));
      refetchRatings();
      messageShownRef.current = true;
    }
    if (!isCreateSuccess && !isUpdateSuccess) {
      messageShownRef.current = false;
    }
  }, [isCreateSuccess, isUpdateSuccess, t, refetchRatings]);

  useEffect(() => {
    if (createError) {
      message.error(`${t('error_submitting_review')}: ${createError.message}`);
    }
    if (updateError) {
      message.error(`${t('error_updating_review')}: ${updateError.message}`);
    }
  }, [createError, updateError, t]);

  const handleRatingSubmit = async (values: { rating: number; comment: string }) => {
    if (values.rating === 0) {
      message.error(t('please_select_a_rating'));
      return;
    }

    if (!currentUserId) {
      message.error(t('you_must_be_logged_in_to_submit_a_review'));
      return;
    }

    messageShownRef.current = false;

    try {
      if (userExistingRating) {
        updateRating({
          id: userExistingRating.id,
          dto: {
            star: values.rating,
            comment: values.comment,
          },
        });
      } else {
        createRating({
          star: values.rating,
          comment: values.comment,
          productId,
        });
      }
    } catch (error) {
      // error được xử lý bởi useEffect
    }
  };

  if (isLoadingRatings || isLoadingAuth) {
    return <div className="text-center py-4 text-gray-600">{t('loading_reviews')}...</div>;
  }

  if (isErrorRatings) {
    return (
      <div className="text-center py-4 text-red-500">
        {t('error_loading_reviews')}: {ratingsError?.message}
      </div>
    );
  }

  const ratings = ratingsData?.data || [];

    // Tạo URL cho trang đăng nhập với returnUrl
  const loginUrl = `/${locale}/login?returnUrl=${encodeURIComponent(pathname)}`;

  return (
    <div className="py-4">
      <Title level={4} className="mb-4">{t('your_review')}</Title>
      {currentUserId ? (
        <Form form={form} layout="vertical" onFinish={handleRatingSubmit}>
          <Form.Item
            label={t('your_rating')}
            name="rating"
            rules={[{ required: true, message: t('please_select_a_rating') }]}
          >
            <Rate disabled={isCreatingRating || isUpdatingRating} />
          </Form.Item>
          <Form.Item label={t('your_comment')} name="comment">
            <TextArea
              rows={4}
              placeholder={t('share_your_thoughts')}
              disabled={isCreatingRating || isUpdatingRating}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={isCreatingRating || isUpdatingRating}
            >
              {userExistingRating ? t('update_review') : t('submit_review')}
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <p className="text-gray-600">
          {t('log_in_to_submit_a_review')}{' '}
          <Link href={loginUrl} className="text-blue-500 underline hover:no-underline font-medium">
            {t('login_now')}
          </Link>
        </p>
      )}

      <div className="mt-8">
        <Title level={4} className="mb-4">{t('customer_reviews')}</Title>
        {ratings.length === 0 ? (
          <p className="text-gray-600">{t('no_customer_reviews_yet')}</p>
        ) : (
          <Space direction="vertical" className="w-full">
            {ratings.map((rating) => (
              <Card key={rating.id} className="w-full shadow-sm border border-gray-200">
                <div className="flex items-start mb-2">
                  {rating.postedBy && (
                    <div className="flex items-center mr-4">
                      <Avatar
                        src={rating.postedBy.profilePicture || undefined}
                        icon={!rating.postedBy.profilePicture && <UserOutlined />}
                        size="large"
                      />
                      <Text strong>{rating.postedBy.name}</Text>
                    </div>
                  )}
                  <div>
                    <Rate disabled value={rating.star} className="text-yellow-500 text-base" />
                    <Text className="ml-2 text-sm text-gray-500 block sm:inline-block">
                      {new Date(rating.createdAt).toLocaleDateString()}{' '}
                      {new Date(rating.createdAt).toLocaleTimeString()}
                    </Text>
                  </div>
                </div>
                <Paragraph className="mb-0">{rating.comment}</Paragraph>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}
