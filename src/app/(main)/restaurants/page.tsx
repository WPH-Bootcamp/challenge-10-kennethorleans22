'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, X } from 'lucide-react';
import {
  useRestaurants,
  useRecommended,
  useNearby,
  useBestSeller,
  useSearchRestaurants,
} from '@/lib/query/resto';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/input';
import Footer from '@/components/shared/Footer';

interface RestaurantCard {
  id: number;
  name: string;
  star: number;
  place: string;
  logo: string;
  lat?: number;
  long?: number;
}

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return d < 1 ? `${(d * 1000).toFixed(0)} m` : `${d.toFixed(1)} km`;
}

const distanceOptions = [
  { label: 'Nearby', value: '0.5' },
  { label: 'Within 1 km', value: '1' },
  { label: 'Within 3 km', value: '3' },
  { label: 'Within 5 km', value: '5' },
];
const ratingOptions = [5, 4, 3, 2, 1];

function CheckboxItem({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-5 h-5 rounded-[6px] flex items-center justify-center cursor-pointer shrink-0 ${
        checked ? 'bg-primary-100' : 'border border-neutral-400 bg-white'
      }`}
    >
      {checked && (
        <svg width='12' height='9' viewBox='0 0 12 9' fill='none'>
          <path d='M1 4L4.5 7.5L11 1' stroke='#FDFDFD' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const { token, _hasHydrated } = useAuthStore();
  const isLoggedIn = _hasHydrated && !!token;

  const q = searchParams.get('q') ?? '';
  const mode = searchParams.get('mode') ?? '';
  const range = searchParams.get('range') ?? '';
  const priceMin = searchParams.get('priceMin') ?? '';
  const priceMax = searchParams.get('priceMax') ?? '';
  const rating = searchParams.get('rating') ?? '';
  const category = searchParams.get('category') ?? '';

  const isSearching = q.length > 0;
  const isRecommended = mode === 'recommended';
  const isNearby = mode === 'nearby';
  const isBestSeller = mode === 'best-seller';
  const isDefaultMode = !isSearching && !isRecommended && !isNearby && !isBestSeller;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Build filters for default mode — pass lat/long when range filter is active
  const defaultFilters = isDefaultMode
    ? {
        range: range ? Number(range) : undefined,
        lat: range && userCoords ? userCoords.lat : undefined,
        long: range && userCoords ? userCoords.lng : undefined,
        priceMin: priceMin ? Number(priceMin) : undefined,
        priceMax: priceMax ? Number(priceMax) : undefined,
        rating: rating ? Number(rating) : undefined,
        category: category || undefined,
      }
    : undefined;
  const hasFilters = defaultFilters && Object.values(defaultFilters).some((v) => v !== undefined);

  const { data: listData, isLoading: listLoading } = useRestaurants(
    hasFilters ? defaultFilters : undefined,
    isDefaultMode
  );
  const { data: recData, isLoading: recLoading } = useRecommended(isRecommended && isLoggedIn);
  const { data: nearbyData, isLoading: nearbyLoading } = useNearby(isNearby && isLoggedIn);
  const { data: bestSellerData, isLoading: bestSellerLoading } = useBestSeller(isBestSeller);
  const { data: searchData, isLoading: searchLoading } = useSearchRestaurants(q);

  // Compute restaurant list per mode
  let restaurants: RestaurantCard[] = [];
  let isLoading = false;

  if (isSearching) {
    restaurants = (searchData?.data?.restaurants ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long,
    }));
    isLoading = searchLoading;
  } else if (isRecommended) {
    restaurants = (recData?.data?.recommendations ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.lat, long: r.long,
    }));
    isLoading = recLoading;
  } else if (isNearby) {
    let raw = nearbyData?.data?.restaurants ?? [];
    if (rating) raw = raw.filter((r) => r.star >= Number(rating));
    if (priceMin) raw = raw.filter((r) => !r.priceRange || r.priceRange.max >= Number(priceMin));
    if (priceMax) raw = raw.filter((r) => !r.priceRange || r.priceRange.min <= Number(priceMax));
    restaurants = raw.map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long,
    }));
    isLoading = nearbyLoading;
  } else if (isBestSeller) {
    let raw = bestSellerData?.data?.restaurants ?? [];
    if (rating) raw = raw.filter((r) => r.star >= Number(rating));
    if (priceMin) raw = raw.filter((r) => !r.priceRange || r.priceRange.max >= Number(priceMin));
    if (priceMax) raw = raw.filter((r) => !r.priceRange || r.priceRange.min <= Number(priceMax));
    restaurants = raw.map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long,
    }));
    isLoading = bestSellerLoading;
  } else {
    restaurants = (listData?.data?.restaurants ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long,
    }));
    isLoading = listLoading;
  }

  const pageTitle = isSearching
    ? `Results for "${q}"`
    : isRecommended ? 'Recommended'
    : isNearby ? 'Nearby'
    : isBestSeller ? 'Best Seller'
    : category ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All Restaurant';

  // Sidebar: hide for search and recommended
  const showSidebar = !isSearching && !isRecommended;
  // Distance filter: only in default mode (nearby/best-seller use dedicated endpoints)
  const showDistanceFilter = isDefaultMode;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.replace(`/restaurants?${params.toString()}`);
  }

  // Auth guard for nearby and recommended
  if (_hasHydrated && !token && (isNearby || isRecommended)) {
    return (
      <div className='min-h-screen flex flex-col bg-white'>
        <main className='flex-1 pt-16 lg:pt-20 flex flex-col items-center justify-center gap-4'>
          <p className='text-lg font-bold text-neutral-950'>
            {isNearby ? 'Please login to see nearby restaurants.' : 'Please login to see recommendations.'}
          </p>
          <Link href='/login' className='px-8 h-12 bg-primary-100 rounded-full flex items-center justify-center'>
            <span className='text-base font-bold text-neutral-25'>Login</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const filterContent = (
    <div className='flex flex-col gap-6 py-4'>
      <div className='px-4'>
        <p className='text-base font-extrabold text-neutral-950 leading-[30px]'>FILTER</p>
      </div>

      {/* Distance — only in default (all restaurant) mode */}
      {showDistanceFilter && (
        <>
          <div className='flex flex-col gap-[10px] px-4'>
            <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Distance</p>
            {distanceOptions.map((opt) => (
              <label key={opt.value} className='flex items-center gap-2 cursor-pointer'>
                <CheckboxItem
                  checked={range === opt.value}
                  onClick={() => updateParam('range', range === opt.value ? '' : opt.value)}
                />
                <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px]'>{opt.label}</span>
              </label>
            ))}
          </div>
          <div className='border-t border-neutral-300' />
        </>
      )}

      {/* Price */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Price</p>
        <div className='flex items-center gap-2 h-[54px] border border-neutral-300 rounded-md px-2'>
          <div className='w-[38px] h-[38px] bg-neutral-100 rounded-[4px] flex items-center justify-center shrink-0'>
            <span className='text-base font-bold text-neutral-950 tracking-[-0.02em] leading-[30px]'>Rp</span>
          </div>
          <Input
            type='number'
            placeholder='Minimum Price'
            value={priceMin}
            onChange={(e) => updateParam('priceMin', e.target.value)}
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
          />
        </div>
        <div className='flex items-center gap-2 h-[54px] border border-neutral-300 rounded-md px-2'>
          <div className='w-[38px] h-[38px] bg-neutral-100 rounded-[4px] flex items-center justify-center shrink-0'>
            <span className='text-base font-bold text-neutral-950 tracking-[-0.02em] leading-[30px]'>Rp</span>
          </div>
          <Input
            type='number'
            placeholder='Maximum Price'
            value={priceMax}
            onChange={(e) => updateParam('priceMax', e.target.value)}
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-neutral-500 focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
          />
        </div>
      </div>

      <div className='border-t border-neutral-300' />

      {/* Rating */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Rating</p>
        <div className='flex flex-col'>
          {ratingOptions.map((r) => (
            <div key={r} onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
              className='flex items-center gap-2 p-2 cursor-pointer'>
              <CheckboxItem
                checked={rating === String(r)}
                onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
              />
              <div className='flex items-center gap-0.5'>
                <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow' />
                <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px]'>{r}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const cardList = (size: 'mobile' | 'desktop') =>
    restaurants.map((restaurant) => {
      const distance =
        userCoords && restaurant.lat != null && restaurant.long != null
          ? calcDistance(userCoords.lat, userCoords.lng, restaurant.lat, restaurant.long)
          : null;
      const isMobile = size === 'mobile';
      return (
        <Link
          key={restaurant.id}
          href={`/restaurants/${restaurant.id}`}
          className={`flex items-center bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] ${
            isMobile ? 'gap-2 p-3' : 'gap-3 p-4'
          }`}
        >
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className={`rounded-xl object-cover shrink-0 ${isMobile ? 'w-[90px] h-[90px]' : 'w-[120px] h-[120px]'}`}
          />
          <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
            <p className={`font-extrabold text-neutral-950 truncate ${isMobile ? 'text-base leading-[30px]' : 'text-lg tracking-[-0.02em] leading-8'}`}>
              {restaurant.name}
            </p>
            <div className='flex items-center gap-1'>
              <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
              <span className={`font-medium text-neutral-950 ${isMobile ? 'text-sm leading-7' : 'text-base leading-[30px] tracking-[-0.03em]'}`}>
                {restaurant.star}
              </span>
            </div>
            <div className='flex items-center gap-1.5 min-w-0'>
              <span className={`font-normal text-neutral-950 tracking-[-0.02em] truncate ${isMobile ? 'text-sm leading-7' : 'text-base leading-[30px]'}`}>
                {restaurant.place}
              </span>
              {distance && (
                <>
                  <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
                  <span className={`font-normal text-neutral-950 tracking-[-0.02em] shrink-0 ${isMobile ? 'text-sm leading-7' : 'text-base leading-[30px]'}`}>
                    {distance}
                  </span>
                </>
              )}
            </div>
          </div>
        </Link>
      );
    });

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <main className='flex-1 px-4 lg:px-[120px] pt-16 lg:pt-20 pb-12'>
        <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950 mb-4 lg:mb-8'>
          {pageTitle}
        </h1>

        {/* Mobile Filter Bar */}
        {showSidebar && (
          <div className='lg:hidden flex items-center justify-between p-3 mb-4 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
            <span className='text-sm font-extrabold text-neutral-950 leading-7'>FILTER</span>
            <button type='button' onClick={() => setShowFilter(true)}>
              <img src='/images/icons/filter-lines.svg' alt='filter' className='w-5 h-5' />
            </button>
          </div>
        )}

        <div className='flex gap-10'>
          {/* Desktop Sidebar */}
          {showSidebar && (
            <aside className='hidden lg:block w-[266px] shrink-0 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] self-start'>
              {filterContent}
            </aside>
          )}

          {/* Restaurant List */}
          <div className='flex-1'>
            {isLoading ? (
              <p className='text-sm text-neutral-500'>Loading...</p>
            ) : restaurants.length === 0 ? (
              <p className='text-sm text-neutral-500'>No restaurants found.</p>
            ) : (
              <>
                <div className='flex flex-col gap-4 lg:hidden'>{cardList('mobile')}</div>
                <div className='hidden lg:grid grid-cols-2 gap-5'>{cardList('desktop')}</div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {showFilter && showSidebar && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='absolute inset-0 bg-black/40' onClick={() => setShowFilter(false)} />
          <div className='absolute left-0 top-0 h-full w-4/5 max-w-[400px] bg-white overflow-y-auto'>
            <div className='flex items-center justify-between p-3 border-b border-neutral-300'>
              <span className='text-sm font-extrabold text-neutral-950 leading-7'>FILTER</span>
              <button type='button' onClick={() => setShowFilter(false)}
                className='w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center'>
                <X size={12} className='text-white' />
              </button>
            </div>
            {filterContent}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}