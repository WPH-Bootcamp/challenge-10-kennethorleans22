'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Minus, ChevronRight } from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { useCart, useUpdateCartItem, useDeleteCartItem } from '@/lib/query/cart';
import { useAuthStore } from '@/store/auth';

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

export default function CartPage() {
  const router = useRouter();
  const { token } = useAuthStore();

  const cartQuery = useCart({ enabled: !!token });
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();

  const cartGroups = cartQuery.data?.data?.cart ?? [];
  const isMutating = updateCartItem.isPending || deleteCartItem.isPending;

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  function handleIncrement(itemId: number, currentQty: number) {
    updateCartItem.mutate({ id: itemId, quantity: currentQty + 1 });
  }

  function handleDecrement(itemId: number, currentQty: number) {
    if (currentQty <= 1) {
      deleteCartItem.mutate(itemId);
    } else {
      updateCartItem.mutate({ id: itemId, quantity: currentQty - 1 });
    }
  }

  if (!token) return null;

  return (
    <div className='min-h-screen bg-neutral-50'>
      <Navbar />
      <main className='pt-16 lg:pt-20'>
        <div className='px-4 lg:px-0 py-4 lg:py-8 flex flex-col gap-4 lg:gap-8 lg:w-[800px] lg:mx-auto'>
          <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
            My Cart
          </h1>

          {cartQuery.isLoading ? (
            <div className='flex justify-center py-20'>
              <p className='text-sm font-medium text-neutral-500'>Loading...</p>
            </div>
          ) : cartGroups.length === 0 ? (
            <div className='flex justify-center py-20'>
              <p className='text-base font-medium text-neutral-500'>Keranjang kamu kosong</p>
            </div>
          ) : (
            <div className='flex flex-col gap-5'>
              {cartGroups.map((group) => (
                <div
                  key={group.restaurant.id}
                  className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-3 lg:gap-5'
                >
                  {/* Restaurant header */}
                  <button   onClick={() => router.push(`/restaurants/${group.restaurant.id}`)}
  className='flex flex-row items-center gap-1 lg:gap-2 cursor-pointer'>
                    <img
                      src={group.restaurant.logo}
                      alt={group.restaurant.name}
                      className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                    />
                    <span className='text-base lg:text-lg font-bold text-neutral-950 leading-[30px] lg:leading-8 tracking-[-0.02em] lg:tracking-[-0.03em]'>
                      {group.restaurant.name}
                    </span>
                    <ChevronRight className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-950 flex-shrink-0' />
                  </button>

                  {/* Cart items */}
                  {group.items.map((item) => (
                    <div key={item.id} className='flex flex-row justify-between items-center'>
                      <div className='flex flex-row items-center gap-[17px]'>
                        <img
                          src={item.menu.image}
                          alt={item.menu.foodName}
                          className='w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover flex-shrink-0'
                        />
                        <div className='flex flex-col'>
                          <p className='text-sm lg:text-base font-medium text-neutral-950 leading-7 lg:leading-[30px] lg:tracking-[-0.03em]'>
                            {item.menu.foodName}
                          </p>
                          <p className='text-base lg:text-lg font-extrabold text-neutral-950 leading-[30px] lg:leading-8 lg:tracking-[-0.02em]'>
                            {formatPrice(item.menu.price)}
                          </p>
                        </div>
                      </div>

                      <div className='flex flex-row items-center gap-4 flex-shrink-0'>
                        <button
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          disabled={isMutating}
                          className='w-9 lg:w-10 h-9 lg:h-10 border border-neutral-300 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed'
                        >
                          <Minus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-950' />
                        </button>
                        <span className='text-base lg:text-lg font-semibold text-neutral-950 tracking-[-0.02em] leading-[30px] lg:leading-8'>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          disabled={isMutating}
                          className='w-9 lg:w-10 h-9 lg:h-10 bg-primary-100 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed'
                        >
                          <Plus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-25' />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Dashed divider */}
                  <hr className='border-t border-dashed border-neutral-300' />

                  {/* Subtotal + Checkout */}
                  <div className='flex flex-col lg:flex-row lg:justify-between lg:items-center gap-3'>
                    <div className='flex flex-col'>
                      <p className='text-sm lg:text-base font-medium text-neutral-950 leading-7 lg:leading-[30px] lg:tracking-[-0.03em]'>
                        Total
                      </p>
                      <p className='text-lg lg:text-xl font-extrabold text-neutral-950 leading-8 lg:leading-[34px] tracking-[-0.02em]'>
                        {formatPrice(group.subtotal)}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/checkout?restaurantId=${group.restaurant.id}`)}
                      className='w-full lg:w-[240px] h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
                    >
                      <span className='text-sm lg:text-base font-bold text-neutral-25 tracking-[-0.02em] leading-7 lg:leading-[30px]'>
                        Checkout
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}