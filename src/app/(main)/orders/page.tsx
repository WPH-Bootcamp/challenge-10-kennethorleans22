'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Star } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import ProfileCard from '@/components/shared/ProfileCard';
import { useOrders } from '@/lib/query/order';
import { useSubmitReview, useMyReviews, useUpdateReview, useDeleteReview } from '@/lib/query/my-review';
import { useAuthStore } from '@/store/auth';
import { Order } from '@/types/order';
import { MyReview } from '@/types/my-review';

const STATUS_FILTERS = [
  { label: 'Preparing',  value: 'preparing' },
  { label: 'On the Way', value: 'on_the_way' },
  { label: 'Delivered',  value: 'delivered' },
  { label: 'Done',       value: 'done' },
  { label: 'Canceled',   value: 'cancelled' },
];

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

function ReviewModal({
  order,
  existingReview,
  onClose,
}: {
  order: Order;
  existingReview?: MyReview;
  onClose: () => void;
}) {
  const isEditing = !!existingReview;
  const [rating, setRating] = useState(existingReview?.star ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReview = useSubmitReview();
  const updateReview = useUpdateReview();
  const deleteReview = useDeleteReview();

  const displayRating = hoveredRating || rating;

  async function handleSubmit() {
    if (rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitReview.mutateAsync({
        transactionId: order.transactionId,
        restaurantId: order.restaurants[0].restaurant.id,
        star: rating,
        comment: comment || undefined,
      });
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  async function handleUpdate() {
    if (rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateReview.mutateAsync({
        id: existingReview!.id,
        body: { star: rating, comment: comment || undefined },
      });
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await deleteReview.mutateAsync(existingReview!.id);
      onClose();
    } catch {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4 lg:px-0'
      style={{ background: 'rgba(10, 13, 18, 0.5)' }}
    >
      <div className='bg-white rounded-2xl p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 w-full max-w-[361px] lg:max-w-[439px]'>
        <div className='flex flex-row items-center justify-between'>
          <span className='text-xl lg:text-2xl font-extrabold leading-[34px] lg:leading-9 text-neutral-950'>
            {isEditing ? 'Update Review' : 'Give Review'}
          </span>
          <button onClick={onClose} className='w-6 h-6 flex items-center justify-center cursor-pointer'>
            <X className='w-6 h-6 text-neutral-950' strokeWidth={2} />
          </button>
        </div>

        <div className='flex flex-col items-center gap-[10px]'>
          <span className='text-base font-extrabold leading-[30px] text-neutral-950 text-center'>
            Give Rating
          </span>
          <div className='flex flex-row items-center gap-1'>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className='w-10 h-10 lg:w-[49px] lg:h-[49px] cursor-pointer'
              >
                <Star
                  className='w-full h-full'
                  fill={star <= displayRating ? '#FDB022' : '#A4A7AE'}
                  stroke='none'
                />
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Please share your thoughts about our service!'
          className='w-full h-[235px] border border-neutral-300 rounded-xl px-3 py-2 text-sm lg:text-base font-normal leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950 placeholder:text-[#717680] resize-none outline-none'
        />

        {isEditing ? (
          <div className='flex flex-row gap-3'>
            <button
              onClick={handleDelete}
              disabled={isSubmitting}
              className='flex-1 h-11 lg:h-12 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {isSubmitting ? '...' : 'Delete'}
              </span>
            </button>
            <button
              onClick={handleUpdate}
              disabled={isSubmitting || rating === 0}
              className='flex-1 h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
            >
              <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
                {isSubmitting ? '...' : 'Update'}
              </span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || rating === 0}
            className='w-full h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
          >
            <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
              {isSubmitting ? 'Sending...' : 'Send'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

function OrderCard({
  order,
  existingReview,
  onReview,
}: {
  order: Order;
  existingReview?: MyReview;
  onReview: (order: Order) => void;
}) {
  return (
    <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-3 lg:gap-4'>
      {order.restaurants.map((group, groupIdx) => (
        <div key={groupIdx} className='flex flex-col gap-3'>
          <div className='flex flex-row items-center gap-2'>
            <img
              src={group.restaurant.logo}
              alt={group.restaurant.name}
              className='w-8 h-8 rounded-full object-cover flex-shrink-0'
            />
            <span className='text-sm lg:text-lg font-bold leading-7 lg:leading-8 tracking-[-0.02em] lg:tracking-[-0.03em] text-neutral-950'>
              {group.restaurant.name}
            </span>
          </div>
          {group.items.map((item, itemIdx) => (
            <div key={itemIdx} className='flex flex-row items-center gap-3 lg:gap-[17px]'>
              <img
                src={item.image ?? ''}
                alt={item.menuName}
                className='w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover flex-shrink-0'
              />
              <div className='flex flex-col'>
                <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                  {item.menuName}
                </span>
                <span className='text-base font-extrabold leading-[30px] text-neutral-950'>
                  {item.quantity} x {formatPrice(item.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
      <hr className='border-t border-neutral-300' />
      <div className='flex flex-col gap-3 lg:flex-row lg:justify-between lg:items-center'>
        <div className='flex flex-col'>
          <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
            Total
          </span>
          <span className='text-base lg:text-xl font-extrabold leading-[30px] lg:leading-[34px] text-neutral-950'>
            {formatPrice(order.pricing.totalPrice)}
          </span>
        </div>
        <button
          onClick={() => onReview(order)}
          className='w-full lg:w-[240px] h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
        >
          <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
            {existingReview ? 'Update Review' : 'Give Review'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);

  const ordersQuery = useOrders(selectedStatus ?? undefined);
  const myReviewsQuery = useMyReviews();

  const orders: Order[] = ordersQuery.data?.data?.orders ?? [];

  const reviewMap = useMemo(() => {
    const map = new Map<string, MyReview>();
    myReviewsQuery.data?.data?.reviews?.forEach((review) => {
      map.set(review.transactionId, review);
    });
    return map;
  }, [myReviewsQuery.data]);

  const filteredOrders = searchQuery
    ? orders.filter((order) =>
        order.restaurants.some(
          (group) =>
            group.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.items.some((item) =>
              item.menuName.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      )
    : orders;

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [_hasHydrated, token, router]);

  if (!_hasHydrated) return null;
  if (!token) return null;

  return (
    <div className='min-h-screen bg-neutral-50 flex flex-col'>
      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          existingReview={reviewMap.get(reviewOrder.transactionId)}
          onClose={() => setReviewOrder(null)}
        />
      )}
      <main className='flex-1 pt-16 lg:pt-20'>
        <div className='px-4 pt-4 pb-8 flex flex-col gap-4 lg:px-0 lg:pt-12 lg:pb-12 lg:w-[1200px] lg:mx-auto lg:flex-row lg:gap-8 lg:items-start'>
          <ProfileCard variant='sidebar' activePage='orders' />

          <div className='flex flex-col gap-4 lg:gap-6 flex-1'>
            <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
              My Orders
            </h1>
            <div className='bg-white rounded-2xl p-4 lg:p-6 flex flex-col gap-5'>
              <div className='flex flex-row items-center gap-[6px] px-4 py-2 border border-neutral-300 rounded-full lg:w-[598px]'>
                <Search
                  className='w-5 h-5 flex-shrink-0'
                  style={{ color: '#717680' }}
                  strokeWidth={1.25}
                />
                <input
                  type='text'
                  placeholder='Search'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='text-sm font-normal leading-7 tracking-[-0.02em] text-[#535862] placeholder:text-[#535862] outline-none w-full bg-transparent'
                />
              </div>

              <div className='flex flex-row items-center gap-2 lg:gap-3 overflow-x-auto'>
                <span className='text-sm lg:text-lg font-bold leading-7 lg:leading-8 tracking-[-0.02em] lg:tracking-[-0.03em] text-neutral-950 flex-shrink-0'>
                  Status
                </span>
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() =>
                      setSelectedStatus((prev) => (prev === filter.value ? null : filter.value))
                    }
                    className={`flex-shrink-0 px-4 py-2 rounded-full border text-sm lg:text-base leading-7 lg:leading-[30px] tracking-[-0.02em] cursor-pointer h-10 lg:h-[46px] ${
                      selectedStatus === filter.value
                        ? 'bg-[#FFECEC] border-primary-100 text-primary-100 font-bold'
                        : 'border-neutral-300 text-neutral-950 font-semibold'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {ordersQuery.isLoading ? (
                <div className='flex justify-center py-8'>
                  <p className='text-sm font-medium text-neutral-500'>Loading...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className='flex justify-center py-8'>
                  <p className='text-sm font-medium text-neutral-500'>No orders yet.</p>
                </div>
              ) : (
                <div className='flex flex-col gap-5'>
                  {filteredOrders.map((order) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      existingReview={reviewMap.get(order.transactionId)}
                      onReview={setReviewOrder}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}