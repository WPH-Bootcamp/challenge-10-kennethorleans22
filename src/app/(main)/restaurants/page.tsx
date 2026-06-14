'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, X } from 'lucide-react';
import { useRestaurants, useSearchRestaurants } from '@/lib/query/resto';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/shared/Navbar';
import Footer from '@/components/shared/Footer';
import { getRestaurantDetail } from '@/lib/api/resto';

const distanceOptions = [
  { label: 'Nearby', value: '0.5' },
  { label: 'Within 1 km', value: '1' },
  { label: 'Within 3 km', value: '3' },
  { label: 'Within 5 km', value: '5' },
];

const ratingOptions = [5, 4, 3, 2, 1];

function calcDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
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
          <path
            d='M1 4L4.5 7.5L11 1'
            stroke='#FDFDFD'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      )}
    </div>
  );
}

export default function RestaurantsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [showFilter, setShowFilter] = useState(false);

  const q = searchParams.get('q') ?? '';
  const isSearching = q.length > 0;

  const range = searchParams.get('range') ?? '';
  const priceMin = searchParams.get('priceMin') ?? '';
  const priceMax = searchParams.get('priceMax') ?? '';
  const rating = searchParams.get('rating') ?? '';
  const category = searchParams.get('category') ?? '';

  const { data: listData, isLoading: listLoading } = useRestaurants(
    isSearching ? undefined : {
      range: range ? Number(range) : undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
      rating: rating ? Number(rating) : undefined,
      category: category || undefined,
    }
  );
  const { data: searchData, isLoading: searchLoading } = useSearchRestaurants(q);

  const restaurants = isSearching
    ? (searchData?.data?.restaurants ?? [])
    : (listData?.data?.restaurants ?? []);
  const isLoading = isSearching ? searchLoading : listLoading;

  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [restaurantCoords, setRestaurantCoords] = useState<Record<number, { lat: number; long: number }>>({});

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {}
    );
  }, []);

  useEffect(() => {
    if (restaurants.length === 0) return;
    Promise.all(restaurants.map((r) => getRestaurantDetail(String(r.id)))).then(
      (details) => {
        const coords: Record<number, { lat: number; long: number }> = {};
        details.forEach((d) => {
          if (d.data.coordinates) coords[d.data.id] = d.data.coordinates;
        });
        setRestaurantCoords(coords);
      }
    );
  }, [restaurants.length]);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/restaurants?${params.toString()}`);
  }

  const filterContent = (
    <div className='flex flex-col gap-6 py-4'>
      <div className='px-4'>
        <p className='text-base font-extrabold text-neutral-950 leading-[30px]'>FILTER</p>
      </div>

      {/* Distance */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Distance</p>
        {distanceOptions.map((opt) => (
          <label key={opt.label} className='flex items-center gap-2 cursor-pointer'>
            <CheckboxItem
              checked={range === opt.value}
              onClick={() => updateParam('range', range === opt.value ? '' : opt.value)}
            />
            <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px]'>
              {opt.label}
            </span>
          </label>
        ))}
      </div>

      <div className='border-t border-neutral-300' />

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
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-neutral-500 placeholder:font-normal focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
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
            className='border-0 p-0 h-auto text-base font-normal text-neutral-950 placeholder:text-neutral-500 placeholder:font-normal focus-visible:ring-0 bg-transparent tracking-[-0.02em]'
          />
        </div>
      </div>

      <div className='border-t border-neutral-300' />

      {/* Rating */}
      <div className='flex flex-col gap-[10px] px-4'>
        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8'>Rating</p>
        <div className='flex flex-col'>
          {ratingOptions.map((r) => (
            <div
              key={r}
              onClick={() => updateParam('rating', rating === String(r) ? '' : String(r))}
              className='flex items-center gap-2 p-2 cursor-pointer'
            >
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

  return (
    <div className='min-h-screen flex flex-col bg-white'>
      <Navbar />

      <main className='flex-1 px-4 lg:px-[120px] pt-20 lg:pt-32 pb-12'>
        <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950 mb-4 lg:mb-8'>
          {isSearching ? `Results for "${q}"` : 'All Restaurant'}
        </h1>

        {/* Mobile: Filter Bar */}
        <div className='lg:hidden flex items-center justify-between p-3 mb-4 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'>
          <span className='text-sm font-extrabold text-neutral-950 leading-7'>FILTER</span>
          <button type='button' onClick={() => setShowFilter(true)}>
            <img src='/images/icons/filter-lines.svg' alt='filter' className='w-5 h-5' />
          </button>
        </div>

        <div className='flex gap-10'>
          {/* Sidebar Desktop */}
          {!isSearching && (
            <aside className='hidden lg:block w-[266px] shrink-0 bg-white rounded-xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] self-start'>
              {filterContent}
            </aside>
          )}

          {/* Daftar Restoran */}
          <div className='flex-1'>
            {isLoading ? (
              <p className='text-sm text-neutral-500'>Loading...</p>
            ) : restaurants.length === 0 ? (
              <p className='text-sm text-neutral-500'>No restaurants found.</p>
            ) : (
              <>
                {/* Mobile: 1 kolom */}
                <div className='flex flex-col gap-4 lg:hidden'>
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurants/${restaurant.id}`}
                      className='flex items-center gap-2 p-3 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
                    >
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className='w-[90px] h-[90px] rounded-xl object-cover shrink-0'
                      />
                      <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
                        <p className='text-base font-extrabold text-neutral-950 leading-[30px] truncate'>{restaurant.name}</p>
                        <div className='flex items-center gap-1'>
                          <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
                          <span className='text-sm font-medium text-neutral-950 leading-7'>{restaurant.star}</span>
                        </div>
                        <div className='flex items-center gap-1.5 min-w-0'>
                          <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7 truncate'>{restaurant.place}</span>
                          {userCoords && restaurantCoords[restaurant.id] && (
                            <>
                              <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
                              <span className='text-sm font-normal text-neutral-950 tracking-[-0.02em] leading-7 shrink-0'>
                                {calcDistance(userCoords.lat, userCoords.lng, restaurantCoords[restaurant.id].lat, restaurantCoords[restaurant.id].long)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Desktop: 2 kolom */}
                <div className='hidden lg:grid grid-cols-2 gap-5'>
                  {restaurants.map((restaurant) => (
                    <Link
                      key={restaurant.id}
                      href={`/restaurants/${restaurant.id}`}
                      className='flex items-center gap-3 p-4 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)]'
                    >
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className='w-[120px] h-[120px] rounded-xl object-cover shrink-0'
                      />
                      <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
                        <p className='text-lg font-extrabold text-neutral-950 tracking-[-0.02em] leading-8 truncate'>{restaurant.name}</p>
                        <div className='flex items-center gap-1'>
                          <Star size={24} fill='var(--color-accent-yellow)' className='text-accent-yellow shrink-0' />
                          <span className='text-base font-medium text-neutral-950 leading-[30px] tracking-[-0.03em]'>{restaurant.star}</span>
                        </div>
                        <div className='flex items-center gap-1.5 min-w-0'>
                          <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px] truncate'>{restaurant.place}</span>
                          {userCoords && restaurantCoords[restaurant.id] && (
                            <>
                              <span className='w-0.5 h-0.5 rounded-full bg-neutral-950 shrink-0' />
                              <span className='text-base font-normal text-neutral-950 tracking-[-0.02em] leading-[30px] shrink-0'>
                                {calcDistance(userCoords.lat, userCoords.lng, restaurantCoords[restaurant.id].lat, restaurantCoords[restaurant.id].long)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Mobile: Filter Drawer */}
      {showFilter && !isSearching && (
        <div className='fixed inset-0 z-50 lg:hidden'>
          <div className='absolute inset-0 bg-black/40' onClick={() => setShowFilter(false)} />
          <div className='absolute left-0 top-0 h-full w-4/5 max-w-[400px] bg-white overflow-y-auto'>
            <div className='flex items-center justify-between p-3 border-b border-neutral-300'>
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