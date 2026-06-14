'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, ClipboardList, LogOut } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import { useOrders } from '@/lib/query/order';
import { useAuthStore } from '@/store/auth';
import { Order } from '@/types/order';

const STATUS_FILTERS = [
  { label: 'Preparing', value: 'preparing' },
  { label: 'On the Way', value: 'on_the_way' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Done', value: 'done' },
  { label: 'Canceled', value: 'cancelled' },
];

function formatPrice(price: number): string {
  return `Rp${price.toLocaleString('id-ID')}`;
}

function OrderCard({ order }: { order: Order }) {
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
        <button className='w-full lg:w-[240px] h-11 lg:h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'>
          <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
            Give Review
          </span>
        </button>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { token, user, clearAuth, _hasHydrated } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const ordersQuery = useOrders(selectedStatus ?? undefined);

  const orders: Order[] = ordersQuery.data?.data?.orders ?? [];

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

  const nameInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  function handleStatusFilter(value: string) {
    setSelectedStatus((prev) => (prev === value ? null : value));
  }

  function handleLogout() {
    clearAuth();
    router.push('/login');
  }

  return (
    <div className='min-h-screen bg-neutral-50 flex flex-col'>
      <main className='flex-1 pt-16 lg:pt-20'>
        <div className='px-4 pt-4 pb-8 flex flex-col gap-4 lg:px-0 lg:pt-12 lg:pb-12 lg:w-[1200px] lg:mx-auto lg:flex-row lg:gap-8 lg:items-start'>
          {/* Sidebar Profile — desktop only */}
          <div className='hidden lg:flex flex-col gap-6 w-[240px] flex-shrink-0 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-5'>
            <div className='flex flex-row items-center gap-2'>
              <div className='w-12 h-12 rounded-full bg-neutral-300 flex items-center justify-center flex-shrink-0'>
                <span className='text-base font-bold text-neutral-950'>{nameInitial}</span>
              </div>
              <span className='text-lg font-bold leading-8 tracking-[-0.03em] text-neutral-950'>
                {user?.name ?? ''}
              </span>
            </div>
            <hr className='border-t border-[#E9EAEB]' />
            <div className='flex flex-col gap-6'>
              <button
                onClick={() => router.push('/')}
                className='flex flex-row items-center gap-2 cursor-pointer'
              >
                <MapPin className='w-6 h-6 text-neutral-950 flex-shrink-0' strokeWidth={2} />
                <span className='text-base font-medium leading-[30px] tracking-[-0.03em] text-neutral-950'>
                  Delivery Address
                </span>
              </button>
              <div className='flex flex-row items-center gap-2'>
                <ClipboardList className='w-6 h-6 text-primary-100 flex-shrink-0' strokeWidth={2} />
                <span className='text-base font-medium leading-[30px] tracking-[-0.03em] text-primary-100'>
                  My Orders
                </span>
              </div>
              <button
                onClick={handleLogout}
                className='flex flex-row items-center gap-2 cursor-pointer'
              >
                <LogOut className='w-6 h-6 text-neutral-950 flex-shrink-0' strokeWidth={2} />
                <span className='text-base font-medium leading-[30px] tracking-[-0.03em] text-neutral-950'>
                  Logout
                </span>
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className='flex flex-col gap-4 lg:gap-6 flex-1'>
            <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
              My Orders
            </h1>
            <div className='bg-white rounded-2xl p-4 lg:p-6 flex flex-col gap-5'>
              {/* Search */}
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

              {/* Status filter */}
              <div className='flex flex-row items-center gap-2 lg:gap-3 overflow-x-auto'>
                <span className='text-sm lg:text-lg font-bold leading-7 lg:leading-8 tracking-[-0.02em] lg:tracking-[-0.03em] text-neutral-950 flex-shrink-0'>
                  Status
                </span>
                {STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => handleStatusFilter(filter.value)}
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

              {/* Order list */}
              {ordersQuery.isLoading ? (
                <div className='flex justify-center py-8'>
                  <p className='text-sm font-medium text-neutral-500'>Loading...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className='flex justify-center py-8'>
                  <p className='text-sm font-medium text-neutral-500'>Belum ada pesanan.</p>
                </div>
              ) : (
                <div className='flex flex-col gap-5'>
                  {filteredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
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