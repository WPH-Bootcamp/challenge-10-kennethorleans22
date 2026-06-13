'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Minus} from 'lucide-react';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { useCart, useUpdateCartItem, useDeleteCartItem } from '@/lib/query/cart';
import { useProfile } from '@/lib/query/profile';
import { useCheckout } from '@/lib/query/order';
import { useAuthStore } from '@/store/auth';

const DELIVERY_FEE = 10000;
const SERVICE_FEE = 1000;

const PAYMENT_METHODS = [
  { id: 'BNI', label: 'Bank Negara Indonesia', icon: '/images/banks/bni.svg' },
  { id: 'BRI', label: 'Bank Rakyat Indonesia', icon: '/images/banks/bri.svg' },
  { id: 'BCA', label: 'Bank Central Asia', icon: '/images/banks/bca.svg' },
  { id: 'Mandiri', label: 'Mandiri', icon: '/images/banks/mandiri.svg' },
];

const checkoutSchema = z.object({
  deliveryAddress: z.string().min(5, 'Masukkan alamat lengkap'),
  phone: z.string().min(8, 'Nomor HP tidak valid'),
  paymentMethod: z.string().min(1, 'Pilih metode pembayaran'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get('restaurantId');
  const { token } = useAuthStore();
  const addressRef = useRef<HTMLInputElement>(null);

  const cartQuery = useCart({ enabled: !!token });
  const profileQuery = useProfile({ enabled: !!token });
  const updateCartItem = useUpdateCartItem();
  const deleteCartItem = useDeleteCartItem();
  const checkoutMutation = useCheckout();

  const cartGroups = cartQuery.data?.data?.cart ?? [];
  const cartGroup = cartGroups.find((g) => g.restaurant.id === Number(restaurantId));
  const profile = profileQuery.data?.data;
  const isMutating = updateCartItem.isPending || deleteCartItem.isPending;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { deliveryAddress: '', phone: '', paymentMethod: '' },
  });

  const selectedPayment = watch('paymentMethod');

  useEffect(() => {
    if (!token) router.push('/login');
  }, [token, router]);

  useEffect(() => {
    if (!restaurantId) router.push('/cart');
  }, [restaurantId, router]);

  useEffect(() => {
    if (profile?.phone) setValue('phone', profile.phone);
  }, [profile, setValue]);

  function handleIncrement(itemId: number, currentQty: number) {
    updateCartItem.mutate({ id: itemId, quantity: currentQty + 1 });
  }

  function handleDecrement(itemId: number, currentQty: number) {
    if (currentQty <= 1) deleteCartItem.mutate(itemId);
    else updateCartItem.mutate({ id: itemId, quantity: currentQty - 1 });
  }

  function onSubmit(values: CheckoutFormValues) {
    if (!cartGroup) return;
    checkoutMutation.mutate(
      {
        restaurants: [
          {
            restaurantId: cartGroup.restaurant.id,
            items: cartGroup.items.map((item) => ({
              menuId: item.menu.id,
              quantity: item.quantity,
            })),
          },
        ],
        deliveryAddress: values.deliveryAddress,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
      },
      {
    onSuccess: () => {
  const params = new URLSearchParams({
    paymentMethod: values.paymentMethod,
    itemTotal: String(subtotal),
    itemCount: String(totalItems),
    total: String(total),
  });
  router.push(`/success?${params.toString()}`);
},
      }
    );
  }

  if (!token || !restaurantId) return null;

  const subtotal = cartGroup?.subtotal ?? 0;
  const totalItems = cartGroup?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const total = subtotal + DELIVERY_FEE + SERVICE_FEE;

  const addressInputProps = register('deliveryAddress');

  return (
    <div className='min-h-screen bg-neutral-50'>
      <Navbar />
      <main className='pt-16 lg:pt-20'>
        <div className='px-4 lg:px-0 py-4 lg:py-12 flex flex-col gap-4 lg:gap-6 lg:w-[1000px] lg:mx-auto'>
          <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
            Checkout
          </h1>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className='flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5'
          >
            {/* ── Left column ── */}
            <div className='flex flex-col gap-4 lg:gap-5 flex-1 min-w-0'>

              {/* Delivery Address Card */}
              <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-4 lg:gap-5'>
                <div className='flex flex-col gap-1'>
                  <div className='flex flex-row items-center gap-2'>
                <img src='/images/icons/delivery-address.svg' alt='' className='w-6 h-6 lg:w-8 lg:h-8 flex-shrink-0' />
                    <span className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 lg:tracking-[-0.02em] text-neutral-950'>
                      Delivery Address
                    </span>
                  </div>
                  <input
                    {...addressInputProps}
                    ref={(el) => {
                      addressInputProps.ref(el);
                      (addressRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                    }}
                    placeholder='Masukkan alamat pengiriman lengkap'
                    className='w-full text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950 bg-transparent outline-none placeholder:text-neutral-400 mt-1'
                  />
                  {errors.deliveryAddress && (
                    <p className='text-xs text-red-500'>{errors.deliveryAddress.message}</p>
                  )}
                  <input
                    {...register('phone')}
                    placeholder='Nomor HP'
                    className='w-full text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950 bg-transparent outline-none placeholder:text-neutral-400'
                  />
                  {errors.phone && (
                    <p className='text-xs text-red-500'>{errors.phone.message}</p>
                  )}
                </div>
                <button
                  type='button'
                  onClick={() => addressRef.current?.focus()}
                  className='w-[120px] h-9 lg:h-10 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer'
                >
                  <span className='text-sm lg:text-base font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                    Change
                  </span>
                </button>
              </div>

              {/* Cart List Card */}
              {cartQuery.isLoading ? (
                <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex justify-center py-10'>
                  <p className='text-sm font-medium text-neutral-500'>Loading...</p>
                </div>
              ) : !cartGroup ? (
                <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex justify-center py-10'>
                  <p className='text-sm font-medium text-neutral-500'>Keranjang kosong</p>
                </div>
              ) : (
                <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-4 lg:gap-5'>
                  {/* Restaurant header */}
                  <div className='flex flex-row justify-between items-center'>
                    <div className='flex flex-row items-center gap-2 lg:gap-2 min-w-0'>
                      <img
                        src={cartGroup.restaurant.logo}
                        alt={cartGroup.restaurant.name}
                        className='w-8 h-8 rounded-full object-cover flex-shrink-0'
                      />
                      <span className='text-base lg:text-lg font-bold leading-[30px] lg:leading-8 tracking-[-0.02em] lg:tracking-[-0.03em] text-neutral-950 truncate'>
                        {cartGroup.restaurant.name}
                      </span>
                    </div>
                    <button
                      type='button'
                      onClick={() => router.push(`/restaurants/${cartGroup.restaurant.id}`)}
                      className='h-9 lg:h-10 px-6 lg:px-8 border border-neutral-300 rounded-full flex items-center justify-center flex-shrink-0 ml-3 cursor-pointer'
                    >
                      <span className='text-sm lg:text-base font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                        Add item
                      </span>
                    </button>
                  </div>

                  {/* Cart items */}
                  {cartGroup.items.map((item) => (
                    <div key={item.id} className='flex flex-row justify-between items-center'>
                      <div className='flex flex-row items-center gap-[17px] min-w-0'>
                        <img
                          src={item.menu.image}
                          alt={item.menu.foodName}
                          className='w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover flex-shrink-0'
                        />
                        <div className='flex flex-col min-w-0'>
                          <p className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950 truncate'>
                            {item.menu.foodName}
                          </p>
                          <p className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 lg:tracking-[-0.02em] text-neutral-950'>
                            {formatPrice(item.menu.price)}
                          </p>
                        </div>
                      </div>
                      <div className='flex flex-row items-center gap-4 flex-shrink-0 ml-3'>
                        <button
                          type='button'
                          onClick={() => handleDecrement(item.id, item.quantity)}
                          disabled={isMutating}
                          className='w-9 lg:w-10 h-9 lg:h-10 border border-neutral-300 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed'
                        >
                          <Minus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-950' />
                        </button>
                        <span className='text-base lg:text-lg font-semibold tracking-[-0.02em] leading-[30px] lg:leading-8 text-neutral-950'>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          onClick={() => handleIncrement(item.id, item.quantity)}
                          disabled={isMutating}
                          className='w-9 lg:w-10 h-9 lg:h-10 bg-primary-100 rounded-full flex items-center justify-center disabled:opacity-60 flex-shrink-0 cursor-pointer disabled:cursor-not-allowed'
                        >
                          <Plus className='w-5 h-5 lg:w-6 lg:h-6 text-neutral-25' />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right column: Payment Card ── */}
            <div className='lg:w-[390px] lg:flex-shrink-0 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] py-4 lg:py-5 flex flex-col gap-4'>

              {/* Payment Method */}
              <div className='flex flex-col gap-3 lg:gap-4 px-4 lg:px-5'>
                <span className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 lg:tracking-[-0.02em] text-neutral-950'>
                  Payment Method
                </span>
                {PAYMENT_METHODS.map((method, index) => (
                  <div key={method.id}>
                    <button
                      type='button'
                      onClick={() => setValue('paymentMethod', method.id, { shouldValidate: true })}
                      className='flex flex-row items-center gap-2 w-full h-10 cursor-pointer'
                    >
                     <div className='w-10 h-10 border border-neutral-300 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden p-1'>
  <img src={method.icon} alt={method.id} className='w-full h-full object-contain' />
</div>
                      <span className='text-sm lg:text-base font-normal leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950 flex-1 text-left'>
                        {method.label}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-colors ${
                          selectedPayment === method.id
                            ? 'bg-primary-100'
                            : 'border-[1.6px] border-neutral-400'
                        }`}
                      >
                        {selectedPayment === method.id && (
                          <div className='w-[10px] h-[10px] bg-white rounded-full' />
                        )}
                      </div>
                    </button>
                    {index < PAYMENT_METHODS.length - 1 && (
                      <hr className='border-t border-neutral-200 mt-3 lg:mt-4' />
                    )}
                  </div>
                ))}
                {errors.paymentMethod && (
                  <p className='text-xs text-red-500'>{errors.paymentMethod.message}</p>
                )}
              </div>

              {/* Dashed divider with notch */}
              <div className='relative flex items-center'>
                <div className='absolute left-0 -translate-x-1/2 w-5 h-5 bg-neutral-50 rounded-full z-10' />
                <div className='absolute right-0 translate-x-1/2 w-5 h-5 bg-neutral-50 rounded-full z-10' />
                <div className='w-full border-t border-dashed border-neutral-300' />
              </div>

              {/* Payment Summary */}
              <div className='flex flex-col gap-3 lg:gap-4 px-4 lg:px-5'>
                <span className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 lg:tracking-[-0.02em] text-neutral-950'>
                  Payment Summary
                </span>
                <div className='flex flex-row justify-between items-center'>
                  <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                    Price ({totalItems} item{totalItems !== 1 ? 's' : ''})
                  </span>
                  <span className='text-sm lg:text-base font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className='flex flex-row justify-between items-center'>
                  <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                    Delivery Fee
                  </span>
                  <span className='text-sm lg:text-base font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                    {formatPrice(DELIVERY_FEE)}
                  </span>
                </div>
                <div className='flex flex-row justify-between items-center'>
                  <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                    Service Fee
                  </span>
                  <span className='text-sm lg:text-base font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                    {formatPrice(SERVICE_FEE)}
                  </span>
                </div>
                <div className='flex flex-row justify-between items-center'>
                  <span className='text-base lg:text-lg font-normal leading-[30px] lg:leading-8 text-neutral-950'>
                    Total
                  </span>
                  <span className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 tracking-[-0.02em] text-neutral-950'>
                    {formatPrice(total)}
                  </span>
                </div>

                {checkoutMutation.isError && (
                  <p className='text-xs text-red-500 text-center'>
                    Checkout gagal. Coba lagi.
                  </p>
                )}

                <button
                  type='submit'
                  disabled={checkoutMutation.isPending || !cartGroup}
                  className='w-full h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center disabled:opacity-60 transition-opacity cursor-pointer disabled:cursor-not-allowed'
                >
                  <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
                    {checkoutMutation.isPending ? 'Processing...' : 'Buy'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}