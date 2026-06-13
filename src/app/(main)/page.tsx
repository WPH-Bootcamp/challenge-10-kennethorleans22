'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Search, Star } from 'lucide-react';
import { useRestaurants } from '@/lib/query/resto';

import Footer from '@/components/shared/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


const categories = [
  { id: 1, label: 'All Restaurant', icon: '/images/categories/all-restaurant.svg' },
  { id: 2, label: 'Nearby', icon: '/images/categories/nearby.svg' },
  { id: 3, label: 'Discount', icon: '/images/categories/discount.svg' },
  { id: 4, label: 'Best Seller', icon: '/images/categories/best-seller.svg' },
  { id: 5, label: 'Delivery', icon: '/images/categories/delivery.svg' },
  { id: 6, label: 'Lunch', icon: '/images/categories/lunch.svg' },
];

export default function HomePage() {
  const { data, isLoading } = useRestaurants();
  const restaurants = Array.isArray(data?.data?.restaurants) ? data.data.restaurants : [];
  // console.log('Total restoran dari API:', restaurants.length); ternyata dari backend hanya ada 6 data restoran sementara codinganku ini kubuat kalau ada lebih dari 6 baru muncul show more, nah kalau datanya saja hanya 6, show more tidak guna karena dari awal sudah ditampilkan semua
const [visibleCount, setVisibleCount] = useState(6);
  return (
    <div className='w-full overflow-x-hidden bg-white'>

      {/* HERO */}
      <section className='relative w-full h-[648px] lg:h-[827px]'>
        <img src='/images/hero-bg.svg' alt='' aria-hidden='true' className='absolute inset-0 w-full h-full object-cover' />
        <div
          className='absolute inset-0'
          style={{ background: 'linear-gradient(180deg, rgba(0, 0, 0, 0) -59.98%, rgba(0, 0, 0, 0.8) 110.09%)' }}
        />
        <div className='relative z-10 flex items-center justify-center h-full px-4'>
          <div className='flex flex-col items-center gap-6 lg:gap-10 w-full max-w-[349px] lg:max-w-[712px]'>
            <div className='flex flex-col items-center gap-1 lg:gap-2 w-full'>
              <h1 className='text-[36px] lg:text-[48px] font-extrabold leading-[44px] lg:leading-[60px] text-white text-center'>
                Explore Culinary Experiences
              </h1>
              <p className='text-[18px] lg:text-[24px] font-bold leading-[32px] lg:leading-[36px] text-white text-center tracking-[-0.03em]'>
                Search and refine your choice to discover the perfect restaurant.
              </p>
            </div>
            <div className='flex items-center gap-[6px] px-4 lg:px-6 bg-white rounded-full w-full h-12 lg:h-14'>
              <Search size={20} strokeWidth={1.25} className='text-neutral-500 shrink-0' />
              <Input
                type='text'
                placeholder='Search restaurants, food and drink'
                className='flex-1 text-sm lg:text-base font-normal text-neutral-600 tracking-[-0.02em] border-none bg-transparent focus-visible:ring-0 p-0 h-auto placeholder:text-neutral-500'
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className='px-4 lg:px-[120px] py-6'>
        <div className='grid grid-cols-3 lg:grid-cols-6 gap-5'>
          {categories.map((cat) => (
            <button key={cat.id} type='button' className='flex flex-col items-center gap-1 lg:gap-1.5'>
              <div className='w-full h-[100px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] flex items-center justify-center p-2'>
                <img src={cat.icon} alt={cat.label} className='w-12 h-12 lg:w-[65px] lg:h-[65px] object-contain' />
              </div>
              <span className='text-sm xl:text-lg font-bold text-neutral-950 tracking-[-0.02em] xl:tracking-[-0.03em] text-center leading-7 xl:leading-8'>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* RECOMMENDED */}
<section className='flex flex-col items-center px-4 lg:px-[120px] pt-6 pb-12 gap-4 lg:gap-8'>
  <div className='flex items-start justify-between w-full max-w-[1200px]'>
    <h2 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>Recommended</h2>
    <Link href='/restaurants' className='text-base lg:text-lg font-extrabold text-primary-100 tracking-[-0.02em]'>See All</Link>
  </div>
  <div className='w-full max-w-[1200px] grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5'>
    {isLoading ? (
      <p className='text-sm text-neutral-500 col-span-full'>Loading...</p>
    ) : (
      restaurants.slice(0, visibleCount).map((restaurant) => (
        <Link key={restaurant.id} href={`/restaurants/${restaurant.id}`}
          className='flex items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
          <img src={restaurant.logo} alt={restaurant.name} className='w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] rounded-xl object-cover shrink-0' />
          <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
            <p className='text-base lg:text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-[30px] lg:leading-8 truncate'>{restaurant.name}</p>
            <div className='flex items-center gap-1'>
              <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
              <span className='text-sm lg:text-base font-medium text-neutral-950 leading-7 lg:leading-[30px] lg:tracking-[-0.03em]'>{restaurant.star}</span>
            </div>
            <div className='flex items-center gap-1.5 min-w-0'>
              <span className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px] truncate'>{restaurant.place}</span>
              <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
              <span className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px] shrink-0'>2.4 km</span>
            </div>
          </div>
        </Link>
      ))
    )}
  </div>
  {visibleCount < restaurants.length && (
    <Button
      type='button'
      variant='outline'
      onClick={() => setVisibleCount((prev) => prev + 3)}
      className='mt-2 w-[160px] h-10 lg:h-12 rounded-full border-neutral-300 text-sm lg:text-base font-bold text-neutral-950 tracking-[-0.02em] hover:bg-transparent'
    >
      Show More
    </Button>
  )}
</section>

      <Footer />
    </div>
  );
}