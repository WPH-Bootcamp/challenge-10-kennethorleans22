'use client';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { getRestaurants, getBestSeller, getNearby } from '@/lib/api/resto';
import { useAuthStore } from '@/store/auth';
import Footer from '@/components/shared/Footer';

const titleMap: Record<string, string> = {
  'all-food': 'All Restaurant',
  'nearby': 'Nearby',
  'discount': 'Discount',
  'best-seller': 'Best Seller',
  'delivery': 'Delivery',
  'lunch': 'Lunch',
};

const filterCategoryMap: Record<string, string | undefined> = {
  'all-food': undefined,
  'discount': 'discount',
  'delivery': 'delivery',
  'lunch': 'lunch',
};

export default function CategoryPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') ?? 'all-food';
  const { token, _hasHydrated } = useAuthStore();

  const isFilterType = type in filterCategoryMap;
  const isNearby = type === 'nearby';
  const isBestSeller = type === 'best-seller';

  const categoryValue = filterCategoryMap[type];

  const { data: filterData, isLoading: filterLoading } = useQuery({
    queryKey: ['restaurants', 'category', type],
    queryFn: () => getRestaurants(categoryValue ? { category: categoryValue } : undefined),
    enabled: isFilterType,
  });

  const { data: nearbyData, isLoading: nearbyLoading } = useQuery({
    queryKey: ['restaurants', 'nearby'],
    queryFn: () => getNearby(),
    enabled: isNearby && !!token,
  });

  const { data: bestSellerData, isLoading: bestSellerLoading } = useQuery({
    queryKey: ['restaurants', 'best-seller'],
    queryFn: () => getBestSeller(),
    enabled: isBestSeller,
  });

  const restaurants = isNearby
    ? (nearbyData?.data?.restaurants ?? [])
    : isBestSeller
    ? (bestSellerData?.data?.restaurants ?? [])
    : (filterData?.data?.restaurants ?? []);

  const isLoading = isNearby ? nearbyLoading : isBestSeller ? bestSellerLoading : filterLoading;
  const title = titleMap[type] ?? 'All Restaurant';

  if (!_hasHydrated) return null;

  return (
    <div className='min-h-screen bg-neutral-50 flex flex-col'>
      <main className='flex-1 pt-16 lg:pt-20'>
        <div className='px-4 pt-4 pb-8 lg:px-[120px] lg:pt-8 lg:pb-12 flex flex-col gap-4 lg:gap-8'>
          <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
            {title}
          </h1>

          {isNearby && !token ? (
            <div className='flex flex-col items-center gap-4 py-16'>
              <p className='text-base font-medium text-neutral-500 leading-[30px] text-center'>
                Please login to see nearby restaurants.
              </p>
              <Link
                href='/login'
                className='h-11 px-8 bg-primary-100 rounded-full flex items-center justify-center'
              >
                <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
                  Login
                </span>
              </Link>
            </div>
          ) : isLoading ? (
            <p className='text-sm text-neutral-500'>Loading...</p>
          ) : restaurants.length === 0 ? (
            <p className='text-sm text-neutral-500'>No restaurants found.</p>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5'>
              {restaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurants/${restaurant.id}`}
                  className='flex items-center gap-2 lg:gap-3 p-3 lg:p-4 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
                >
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className='w-[90px] h-[90px] lg:w-[120px] lg:h-[120px] rounded-xl object-cover shrink-0'
                  />
                  <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
                    <p className='text-base lg:text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-[30px] lg:leading-8 truncate'>
                      {restaurant.name}
                    </p>
                    <div className='flex items-center gap-1'>
                      <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
                      <span className='text-sm lg:text-base font-medium text-neutral-950 leading-7 lg:leading-[30px] lg:tracking-[-0.03em]'>
                        {restaurant.star}
                      </span>
                    </div>
                    <span className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7 lg:leading-[30px] truncate'>
                      {restaurant.place}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}