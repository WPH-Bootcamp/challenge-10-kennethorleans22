'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Star, Share2, Plus, Minus } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { useRestaurantDetail } from '@/lib/query/resto';
import {
  useCart,
  useAddToCart,
  useUpdateCartItem,
  useDeleteCartItem,
} from '@/lib/query/cart';
import { useAuthStore } from '@/store/auth';
import { MenuItem } from '@/types/menu';

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

function formatDate(dateString: string): string {
  const d = new Date(dateString);
  const date = d.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${date}, ${hours}:${minutes}`;
}

function calcDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
}

const INITIAL_SHOW = 8;

export default function RestaurantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState('All Menu');
  const [currentImage, setCurrentImage] = useState(0);
  const [showAll, setShowAll] = useState(false);

  const detailQuery = useRestaurantDetail(id);
  const cartQuery = useCart({ enabled: !!token });

  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();

  const restaurant = detailQuery.data?.data;
  const menus = restaurant?.menus ?? [];
  const reviews = restaurant?.reviews ?? [];
  const images = restaurant?.images ?? [];

  const categories = [
    'All Menu',
    ...Array.from(new Set(menus.map((m) => m.type).filter(Boolean))),
  ];

  const filteredMenus =
    activeTab === 'All Menu'
      ? menus
      : menus.filter((m) => m.type === activeTab);

  const displayedMenus = showAll
    ? filteredMenus
    : filteredMenus.slice(0, INITIAL_SHOW);

  const cartGroups = cartQuery.data?.data?.cart ?? [];
  const cartGroup = cartGroups.find((g) => g.restaurant.id === Number(id));
  const cartItems = cartGroup?.items ?? [];
  const totalCartItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalCartPrice = cartGroup?.subtotal ?? 0;

  function getCartItem(menuId: number) {
    return cartItems.find((i) => i.menu.id === menuId);
  }

  function handleAdd(item: MenuItem) {
    if (!token) {
      router.push('/login');
      return;
    }
    addToCart.mutate({
      restaurantId: Number(id),
      menuId: item.id,
      quantity: 1,
    });
  }

  function handleIncrement(cartItemId: number, currentQty: number) {
    updateCartItem.mutate({ id: cartItemId, quantity: currentQty + 1 });
  }

  function handleDecrement(cartItemId: number, currentQty: number) {
    if (currentQty <= 1) {
      deleteCartItem.mutate(cartItemId);
    } else {
      updateCartItem.mutate({ id: cartItemId, quantity: currentQty - 1 });
    }
  }

  const isMutating =
    addToCart.isPending || updateCartItem.isPending || deleteCartItem.isPending;
  const [userCoords, setUserCoords] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const distance =
    userCoords && restaurant?.coordinates
      ? calcDistance(
          userCoords.lat,
          userCoords.lng,
          restaurant.coordinates.lat,
          restaurant.coordinates.long
        )
      : null;
  return (
    <div className='min-h-screen bg-white'>
      <Navbar />

      <main className='pt-16 lg:pt-20 pb-24 lg:pb-28'>
        <div className='px-4 lg:px-[120px] flex flex-col gap-4 lg:gap-8 pt-4 pb-10 lg:py-8'>
          {/* ── GALLERY MOBILE ── */}
          <div className='lg:hidden flex flex-col items-center gap-3'>
            <img
              src={images[currentImage] ?? '/images/placeholder.png'}
              alt={restaurant?.name ?? ''}
              className='w-full h-[260px] rounded-2xl object-cover'
            />
            {images.length > 1 && (
              <div className='flex items-center gap-1'>
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentImage ? 'bg-primary-100' : 'bg-[#D9D9D9]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── GALLERY DESKTOP: 651px kiri + kolom kanan (302px atas + 148px bawah ×2) ── */}
          <div className='hidden lg:flex flex-row items-center gap-5 h-[470px]'>
            <img
              src={images[0] ?? '/images/placeholder.png'}
              alt={restaurant?.name ?? ''}
              className='w-[651px] h-full rounded-2xl object-cover flex-shrink-0'
            />
            <div className='flex flex-col gap-5 flex-1 h-full min-w-0'>
              <img
                src={images[1] ?? images[0] ?? '/images/placeholder.png'}
                alt=''
                className='w-full h-[302px] rounded-2xl object-cover flex-shrink-0'
              />
              <div className='flex flex-row gap-5 flex-1 min-h-0'>
                <img
                  src={images[2] ?? images[0] ?? '/images/placeholder.png'}
                  alt=''
                  className='flex-1 w-0 min-w-0 rounded-2xl object-cover'
                />
                <img
                  src={images[3] ?? images[0] ?? '/images/placeholder.png'}
                  alt=''
                  className='flex-1 w-0 min-w-0 rounded-2xl object-cover'
                />
              </div>
            </div>
          </div>

          {/* ── INFO RESTORAN MOBILE ── */}
          <div className='flex lg:hidden flex-row justify-between items-center'>
            <div className='flex flex-row items-center gap-2'>
              {restaurant?.logo ? (
                <img
                  src={restaurant.logo}
                  alt={restaurant.name ?? ''}
                  className='w-[90px] h-[90px] rounded-full object-cover flex-shrink-0'
                />
              ) : (
                <div className='w-[90px] h-[90px] rounded-full bg-neutral-200 flex-shrink-0' />
              )}
              <div className='flex flex-col gap-0.5'>
                <p className='text-base font-extrabold text-neutral-950 leading-[30px]'>
                  {restaurant?.name}
                </p>
                <div className='flex items-center gap-1'>
                  <Star
                    size={24}
                    fill='var(--color-accent-yellow)'
                    className='text-accent-yellow'
                  />
                  <span className='text-sm font-medium text-neutral-950 leading-7'>
                    {restaurant?.star}
                  </span>
                </div>
                <div className='flex items-center gap-1.5'>
                  <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7'>
                    {restaurant?.place}
                  </span>
                  <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 flex-shrink-0' />
                  <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7'>
                    {distance ?? restaurant?.category}
                  </span>
                </div>
              </div>
            </div>
            <button className='w-[44px] h-[44px] border border-neutral-300 rounded-full flex items-center justify-center flex-shrink-0'>
              <Share2 className='w-5 h-5 text-neutral-950' />
            </button>
          </div>

          {/* ── INFO RESTORAN DESKTOP ── */}
          <div className='hidden lg:flex flex-row items-center gap-4'>
            {restaurant?.logo ? (
              <img
                src={restaurant.logo}
                alt={restaurant.name ?? ''}
                className='w-[120px] h-[120px] rounded-full object-cover flex-shrink-0'
              />
            ) : (
              <div className='w-[120px] h-[120px] rounded-full bg-neutral-200 flex-shrink-0' />
            )}
            <div className='flex flex-col gap-1 flex-1 min-w-0'>
              <p className='text-[32px] font-extrabold leading-[42px] text-neutral-950'>
                {restaurant?.name}
              </p>
              <div className='flex items-center gap-1'>
                <Star
                  size={24}
                  fill='var(--color-accent-yellow)'
                  className='text-accent-yellow'
                />
                <span className='text-lg font-semibold leading-8 tracking-[-0.02em] text-neutral-950'>
                  {restaurant?.star}
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <span className='text-lg font-medium leading-8 text-neutral-950'>
                  {restaurant?.place}
                </span>
                <span className='w-0.5 h-0.5 rounded-full bg-neutral-900 flex-shrink-0' />
                <span className='text-lg font-medium leading-8 text-neutral-950'>
                  {distance ?? restaurant?.category}
                </span>
              </div>
            </div>
            <button className='w-[140px] h-[44px] border border-neutral-300 rounded-full flex items-center justify-center gap-3 flex-shrink-0 px-4'>
              <Share2 className='w-6 h-6 text-neutral-950' />
              <span className='text-base font-bold tracking-[-0.02em] leading-[30px] text-neutral-950'>
                Share
              </span>
            </button>
          </div>

          <hr className='border-t border-neutral-300' />

          {/* ── MENU SECTION ── */}
          <div className='flex flex-col gap-4 lg:gap-6'>
            <p className='text-2xl lg:text-[36px] font-extrabold leading-9 lg:leading-[44px] text-neutral-950'>
              Menu
            </p>

            {/* Tabs */}
            <div className='flex flex-row items-center gap-2 lg:gap-3 flex-wrap'>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setActiveTab(cat);
                    setShowAll(false);
                  }}
                  className={
                    cat === activeTab
                      ? 'bg-[#FFECEC] border border-primary-100 rounded-full px-4 h-[40px] lg:h-[46px] flex items-center'
                      : 'border border-neutral-300 rounded-full px-4 h-[40px] lg:h-[46px] flex items-center'
                  }
                >
                  <span
                    className={
                      cat === activeTab
                        ? 'text-sm lg:text-base font-bold text-primary-100 tracking-[-0.02em] leading-7 lg:leading-[30px] capitalize'
                        : 'text-sm lg:text-base font-semibold text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px] capitalize'
                    }
                  >
                    {cat}
                  </span>
                </button>
              ))}
            </div>

            {/* Cards — GRID: 2 kolom mobile, 4 kolom desktop */}
            <div className='grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5'>
              {displayedMenus.map((item) => {
                const cartItem = getCartItem(item.id);
                const qty = cartItem?.quantity ?? 0;
                return (
                  <div
                    key={item.id}
                    className='rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] bg-white overflow-hidden'
                  >
                    <img
                      src={item.image}
                      alt={item.foodName}
                      className='w-full h-[172px] lg:h-[285px] rounded-t-2xl object-cover'
                    />
                    <div className='p-3 lg:p-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center'>
                      <div className='flex flex-col'>
                        <p className='text-sm lg:text-base font-medium text-neutral-950 leading-7 lg:leading-[30px] lg:tracking-[-0.03em]'>
                          {item.foodName}
                        </p>
                        <p className='text-base lg:text-lg font-extrabold text-neutral-950 leading-[30px] lg:leading-8 lg:tracking-[-0.02em]'>
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {qty === 0 ? (
                        <button
                          onClick={() => handleAdd(item)}
                          disabled={isMutating}
                          className='w-full lg:w-[79px] h-9 lg:h-[40px] bg-primary-100 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0'
                        >
                          <span className='text-sm lg:text-base font-bold text-neutral-25 tracking-[-0.02em] leading-7 lg:leading-[30px]'>
                            Add
                          </span>
                        </button>
                      ) : (
                        <div className='flex items-center gap-4 flex-shrink-0 justify-start'>
                          <button
                            onClick={() => handleDecrement(cartItem!.id, qty)}
                            disabled={isMutating}
                            className='w-9 lg:w-[40px] h-9 lg:h-[40px] border border-neutral-300 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0'
                          >
                            <Minus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-950' />
                          </button>
                          <span className='text-base lg:text-lg font-semibold text-neutral-950 tracking-[-0.02em] leading-[30px] lg:leading-8'>
                            {qty}
                          </span>
                          <button
                            onClick={() => handleIncrement(cartItem!.id, qty)}
                            disabled={isMutating}
                            className='w-9 lg:w-[40px] h-9 lg:h-[40px] bg-primary-100 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0'
                          >
                            <Plus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-25' />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Tombol Lihat Semua */}
            {!showAll && filteredMenus.length > INITIAL_SHOW && (
              <div className='flex justify-center'>
                <button
                  onClick={() => setShowAll(true)}
                  className='w-[160px] h-[40px] lg:h-[48px] border border-neutral-300 rounded-full flex items-center justify-center'
                >
                  <span className='text-sm lg:text-base font-bold text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px]'>
                    Lihat Semua
                  </span>
                </button>
              </div>
            )}
          </div>

          <hr className='border-t border-neutral-300' />

          {/* ── REVIEW SECTION ── */}
          <div className='flex flex-col gap-4 lg:gap-6'>
            <div className='flex flex-col gap-2 lg:gap-3'>
              <p className='text-2xl lg:text-[36px] font-extrabold leading-9 lg:leading-[44px] text-neutral-950'>
                Review
              </p>
              <div className='flex items-center gap-1'>
                <Star
                  size={24}
                  fill='var(--color-accent-yellow)'
                  className='text-accent-yellow lg:w-[34px] lg:h-[34px]'
                />
                <span className='text-base lg:text-xl font-extrabold text-neutral-950 leading-[30px] lg:leading-[34px]'>
                  {restaurant?.star} ({reviews.length} Ulasan)
                </span>
              </div>
            </div>

            <div className='flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5'>
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className='w-full rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] bg-white p-4 flex flex-col gap-4'
                >
                  <div className='flex flex-row items-start gap-3'>
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className='w-[58px] lg:w-16 h-[58px] lg:h-16 rounded-full object-cover flex-shrink-0'
                      />
                    ) : (
                      <div className='w-[58px] lg:w-16 h-[58px] lg:h-16 rounded-full bg-neutral-200 flex-shrink-0' />
                    )}
                    <div className='flex flex-col'>
                      <p className='text-base lg:text-lg font-extrabold text-neutral-950 leading-[30px] lg:leading-8 lg:tracking-[-0.02em]'>
                        {review.user.name}
                      </p>
                      <p className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px]'>
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-0 lg:gap-0.5'>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        fill={
                          i < review.star
                            ? 'var(--color-accent-yellow)'
                            : 'var(--color-neutral-200)'
                        }
                        className={
                          i < review.star
                            ? 'text-accent-yellow'
                            : 'text-neutral-200'
                        }
                      />
                    ))}
                  </div>

                  {review.comment && (
                    <p className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px]'>
                      {review.comment}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* ── STICKY CART BAR ── */}
      {totalCartItems > 0 && (
        <div className='fixed bottom-0 left-0 right-0 z-40 h-[64px] lg:h-[80px] bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] px-4 lg:px-[120px] flex flex-row justify-between items-center'>
          <div className='flex flex-col gap-0.5'>
            <div className='flex items-center gap-1 lg:gap-2'>
              <img
                src='/images/icons/shopping-bag.svg'
                alt=''
                className='w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 invert'
              />
              <span className='text-sm lg:text-base font-normal tracking-[-0.02em] leading-7 lg:leading-[30px] text-neutral-950'>
                {totalCartItems} Item{totalCartItems > 1 ? 's' : ''}
              </span>
            </div>
            <p className='text-base lg:text-xl font-extrabold leading-[30px] lg:leading-[34px] text-neutral-950'>
              {formatPrice(totalCartPrice)}
            </p>
          </div>
          <button
            onClick={() => router.push(`/checkout?restaurantId=${id}`)}
            className='w-[160px] lg:w-[230px] h-[40px] lg:h-[44px] bg-primary-100 rounded-full flex items-center justify-center'
          >
            <span className='text-sm lg:text-base font-bold tracking-[-0.02em] leading-7 lg:leading-[30px] text-neutral-25'>
              Checkout
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
