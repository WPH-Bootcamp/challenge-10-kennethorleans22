'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

const PAYMENT_LABELS: Record<string, string> = {
  BNI: 'Bank Negara Indonesia',
  BRI: 'Bank Rakyat Indonesia',
  BCA: 'Bank Central Asia',
  Mandiri: 'Mandiri',
};

const DELIVERY_FEE = 10000;
const SERVICE_FEE = 1000;

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentMethodId = searchParams.get('paymentMethod') ?? '';
  const itemTotal = Number(searchParams.get('itemTotal') ?? 0);
  const itemCount = Number(searchParams.get('itemCount') ?? 0);
  const total = Number(searchParams.get('total') ?? 0);

  const paymentMethodLabel = PAYMENT_LABELS[paymentMethodId] ?? paymentMethodId;

  const formattedDate = useMemo(() => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeStr = now.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${dateStr}, ${timeStr}`;
  }, []);

  return (
    <div className='min-h-screen bg-neutral-50 pt-[132px] lg:pt-[211px] pb-8'>
      <div className='px-4 lg:px-0 flex flex-col items-center gap-7 lg:w-[428px] lg:mx-auto'>

        {/* Logo */}
        <div className='flex flex-row justify-center items-center gap-[15px]'>
          <Image src='/images/foody-logo.svg' alt='Foody' width={42} height={42} />
          <span className='text-[32px] font-extrabold leading-[42px] text-neutral-950'>
            Foody
          </span>
        </div>

        {/* Card */}
        <div className='relative w-full bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-4'>

          {/* Success Header */}
          <div className='flex flex-col items-center gap-0.5'>
        <img src='/images/icons/check-one.svg' alt='' className='w-16 h-16' />
            <p className='text-lg lg:text-xl font-extrabold leading-8 lg:leading-[34px] tracking-[-0.02em] text-neutral-950 text-center'>
              Payment Success
            </p>
            <p className='text-sm lg:text-base font-normal leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950 text-center'>
              Your payment has been successfully processed.
            </p>
          </div>

          {/* First dashed divider with notches */}
          <div className='relative -mx-4 lg:-mx-5'>
            <hr className='border-t border-dashed border-neutral-300' />
            <div className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-neutral-50' />
            <div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-neutral-50' />
          </div>

          {/* Info Rows */}
          <div className='flex flex-col'>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                Date
              </span>
              <span className='text-sm lg:text-base font-semibold lg:font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {formattedDate}
              </span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                Payment Method
              </span>
              <span className='text-sm lg:text-base font-semibold lg:font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {paymentMethodLabel}
              </span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                Price ({itemCount} items)
              </span>
              <span className='text-sm lg:text-base font-semibold lg:font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {formatPrice(itemTotal)}
              </span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                Delivery Fee
              </span>
              <span className='text-sm lg:text-base font-semibold lg:font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {formatPrice(DELIVERY_FEE)}
              </span>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <span className='text-sm lg:text-base font-medium leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950'>
                Service Fee
              </span>
              <span className='text-sm lg:text-base font-semibold lg:font-bold leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950'>
                {formatPrice(SERVICE_FEE)}
              </span>
            </div>
          </div>

          {/* Second dashed divider with notches */}
          <div className='relative -mx-4 lg:-mx-5'>
            <hr className='border-t border-dashed border-neutral-300' />
            <div className='absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-neutral-50' />
            <div className='absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 rounded-full bg-neutral-50' />
          </div>

          {/* Total */}
          <div className='flex flex-row justify-between items-center'>
            <span className='text-base lg:text-lg font-normal leading-[30px] lg:leading-8 tracking-[-0.02em] text-neutral-950'>
              Total
            </span>
            <span className='text-base lg:text-lg font-extrabold leading-[30px] lg:leading-8 tracking-[-0.02em] text-neutral-950'>
              {formatPrice(total)}
            </span>
          </div>

          {/* Button */}
          <button
            onClick={() => router.push('/orders')}
            className='w-full h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
          >
            <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
              See My Orders
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}