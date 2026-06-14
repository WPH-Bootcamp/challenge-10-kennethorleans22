'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, X } from 'lucide-react';
import { useRestaurants, useRecommended, useBestSeller, useSearchRestaurants } from '@/lib/query/resto';
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
  priceRange?: { min: number; max: number };
}

function calcDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number): string {
  return km < 1 ? `${(km * 1000).toFixed(0)} m` : `${km.toFixed(1)} km`;
}

function Checkbox({ checked, onClick }: { checked: boolean; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`w-5 h-5 rounded-[6px] flex items-center justify-center cursor-pointer shrink-0 ${
        checked ? 'bg-primary-100' : 'border border-[#A4A7AE] bg-white'
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

interface CardProps {
  restaurant: RestaurantCard;
  userCoords: { lat: number; lng: number } | null;
}

function Card({ restaurant, userCoords }: CardProps) {
  const distKm =
    userCoords && restaurant.lat != null && restaurant.long != null
      ? calcDistanceKm(userCoords.lat, userCoords.lng, restaurant.lat, restaurant.long)
      : null;
  const distStr = distKm != null ? formatDist(distKm) : null;

  return (
    <Link
      href={`/restaurants/${restaurant.id}`}
      className='flex items-center bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
    >
      {/* Mobile */}
      <div className='flex lg:hidden items-center gap-2 p-3 w-full'>
        <img src={restaurant.logo} alt={restaurant.name} className='w-[90px] h-[90px] rounded-xl object-cover shrink-0' />
        <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
          <p className='text-base font-extrabold text-neutral-950 leading-[30px] truncate'>{restaurant.name}</p>
          <div className='flex items-center gap-1'>
            <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
            <span className='text-sm font-medium text-neutral-950 leading-7'>{restaurant.star}</span>
          </div>
          <div className='flex items-center gap-1.5 min-w-0'>
            <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7 truncate'>{restaurant.place}</span>
            {distStr && (
              <>
                <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
                <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7 shrink-0'>{distStr}</span>
              </>
            )}
          </div>
        </div>
      </div>
      {/* Desktop */}
      <div className='hidden lg:flex items-center gap-3 p-4 w-full'>
        <img src={restaurant.logo} alt={restaurant.name} className='w-[120px] h-[120px] rounded-xl object-cover shrink-0' />
        <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
          <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8 truncate'>{restaurant.name}</p>
          <div className='flex items-center gap-1'>
            <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
            <span className='text-base font-medium text-neutral-950 leading-[30px] tracking-[-0.03em]'>{restaurant.star}</span>
          </div>
          <div className='flex items-center gap-1.5 min-w-0'>
            <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px] truncate'>{restaurant.place}</span>
            {distStr && (
              <>
                <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
                <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px] shrink-0'>{distStr}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

const distanceOptions = [
  { label: 'Nearby', value: '0.5' },
  { label: 'Within 1 km', value: '1' },
  { label: 'Within 3 km', value: '3' },
  { label: 'Within 5 km', value: '5' },
];
const ratingOptions = [5, 4, 3, 2, 1];

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
  const isBestSeller = mode === 'best-seller';
  const isNearby = mode === 'nearby';
  // All modes except recommended/best-seller/search use /api/resto with server-side filters
  const isDefaultApi = !isSearching && !isRecommended && !isBestSeller;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  // Build filters for /api/resto — include lat/long when range is selected and user granted location
  const apiFilters = isDefaultApi
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

  const { data: listData, isLoading: listLoading } = useRestaurants(apiFilters, isDefaultApi);
  const { data: recData, isLoading: recLoading } = useRecommended(isRecommended && isLoggedIn);
  const { data: bestData, isLoading: bestLoading } = useBestSeller(isBestSeller);
  const { data: searchData, isLoading: searchLoading } = useSearchRestaurants(q);

  // Normalise all API results to RestaurantCard
  let rawCards: RestaurantCard[] = [];
  let isLoading = false;

  if (isSearching) {
    rawCards = (searchData?.data?.restaurants ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long, priceRange: r.priceRange,
    }));
    isLoading = searchLoading;
  } else if (isRecommended) {
    rawCards = (recData?.data?.recommendations ?? []).map((r) => {
      const prices = (r.sampleMenus ?? []).map((m) => m.price);
      return {
        id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
        lat: r.lat, long: r.long,
        priceRange: prices.length > 0 ? { min: Math.min(...prices), max: Math.max(...prices) } : undefined,
      };
    });
    isLoading = recLoading;
  } else if (isBestSeller) {
    rawCards = (bestData?.data?.restaurants ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long, priceRange: r.priceRange,
    }));
    isLoading = bestLoading;
  } else {
    rawCards = (listData?.data?.restaurants ?? []).map((r) => ({
      id: r.id, name: r.name, star: r.star, place: r.place, logo: r.logo,
      lat: r.coordinates?.lat, long: r.coordinates?.long, priceRange: r.priceRange,
    }));
    isLoading = listLoading;
  }

  // Client-side filtering for recommended and best-seller (server handles default mode filters)
  let restaurants = rawCards;
  if (isRecommended || isBestSeller) {
    if (rating) restaurants = restaurants.filter((r) => r.star >= Number(rating));
    if (priceMin) restaurants = restaurants.filter((r) => !r.priceRange || r.priceRange.max >= Number(priceMin));
    if (priceMax) restaurants = restaurants.filter((r) => !r.priceRange || r.priceRange.min <= Number(priceMax));
    if (range && userCoords) {
      restaurants = restaurants.filter((r) => {
        if (r.lat == null || r.long == null) return true;
        return calcDistanceKm(userCoords.lat, userCoords.lng, r.lat, r.long) <= Number(range);
      });
    }
  }

  const pageTitle = isSearching
    ? `Results for "${q}"`
    : isRecommended ? 'Recommended'
    : isBestSeller ? 'Best Seller'
    : isNearby ? 'Nearby'
    : category ? category.charAt(0).toUpperCase() + category.slice(1)
    : 'All Restaurant';

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    router.replace(`/restaurants?${params.toString()}`);
  }

  // Auth guard: recommended requires login
  if (_hasHydrated && !token && isRecommended) {
    return (
      <div className='min-h-screen flex flex-col bg-white'>
        <main className='flex-1 pt-20 lg:pt-32 flex flex-col items-center justify-center gap-4'>
          <p className='text-lg font-bold text-neutral-950'>Please login to see recommendations.</p>
          <Link href='/login' className='px-8 h-12 bg-primary-100 rounded-full flex items-center justify-center'>
            <span className='text-base font-bold text-neutral-25'>Login</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Shared filter sidebar content — same for ALL 7 modes
  const filterContent = (
    <div className='flex flex-col gap-6 py-4'>
      {/* FILTER heading + Distance section (same block per Figma) */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-base font-extrabold text-neutral-950 leading-[30px]'>FILTER</p>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Distance</p>
        {distanceOptions.map((opt) => (
          <div key={opt.value} className='flex items-center gap-2'>
            <Checkbox
              checked={range === opt.value}
              onClick={() => updateParam('range', range === opt.value ? '' : opt.value)}
            />
            <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px]'>
              {opt.label}
            </span>
          </div>
        ))}
      </div>

      <div className='border-t border-neutral-300' />

      {/* Price */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Price</p>
        <div className='flex items-center gap-2 h-[54px] border border-neutral-300 rounded-lg px-2'>
          <div className='w-[38px] h-[38px] bg-[#F5F5F5] rounded-[4px] flex items-center justify-center shrink-0'>
            <span className='text-base font-bold text-neutral-950 tracking-[-0.02em]'>Rp</span>
          </div>
          <Input
            type='number'
            placeholder='Minimum Price'
            value={priceMin}
            onChange={(e) => updateParam('priceMin', e.target.value)}
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-[#717680] focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
          />
        </div>
        <div className='flex items-center gap-2 h-[54px] border border-neutral-300 rounded-lg px-2'>
          <div className='w-[38px] h-[38px] bg-[#F5F5F5] rounded-[4px] flex items-center justify-center shrink-0'>
            <span className='text-base font-bold text-neutral-950 tracking-[-0.02em]'>Rp</span>
          </div>
          <Input
            type='number'
            placeholder='Maximum Price'
            value={priceMax}
            onChange={(e) => updateParam('priceMax', e.target.value)}
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-[#717680] focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
          />
        </div>
      </div>

      <div className='border-t border-neutral-300' />

      {/* Rating */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Rating</p>
        {ratingOptions.map((r) => (
          <div key={r} className='flex items-center gap-2 p-2'>
            <Checkbox
              checked={rating === String(r)}
              onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
            />
            <div className='flex items-center gap-0.5'>
              <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
              <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px]'>{r}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <main className='flex-1 px-4 lg:px-[120px] pt-20 lg:pt-32 pb-12'>

        {/* Page title */}
        <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
          {pageTitle}
        </h1>

        {/* Mobile filter bar */}
        <div className='lg:hidden flex items-center justify-between p-3 mt-4 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
          <span className='text-sm font-extrabold text-neutral-950 leading-7'>FILTER</span>
          <button type='button' onClick={() => setShowFilter(true)}>
            <img src='/images/icons/filter-lines.svg' alt='filter' className='w-5 h-5' />
          </button>
        </div>

        {/* Content area */}
        <div className='flex gap-10 mt-4 lg:mt-8'>
          {/* Desktop sidebar */}
          <aside className='hidden lg:block w-[266px] shrink-0 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] self-start'>
            {filterContent}
          </aside>

          {/* Restaurant list */}
          <div className='flex-1'>
            {isLoading ? (
              <p className='text-sm text-neutral-500'>Loading...</p>
            ) : restaurants.length === 0 ? (
              <p className='text-sm text-neutral-500'>No restaurants found.</p>
            ) : (
              <div className='flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-5'>
                {restaurants.map((r) => (
                  <Card key={r.id} restaurant={r} userCoords={userCoords} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile filter drawer */}
      {showFilter && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='absolute inset-0 bg-black/40' onClick={() => setShowFilter(false)} />
          <div className='absolute left-0 top-0 h-full w-4/5 max-w-[360px] bg-white overflow-y-auto'>
            <div className='flex items-center justify-between px-4 py-3 border-b border-neutral-300'>
              <span className='text-sm font-extrabold text-neutral-950 leading-7'>FILTER</span>
              <button
                type='button'
                onClick={() => setShowFilter(false)}
                className='w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center'
              >
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