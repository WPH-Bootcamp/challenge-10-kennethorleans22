'use client';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface ProfileCardProps {
  variant: 'dropdown' | 'sidebar';
  activePage?: 'orders';
  onClose?: () => void;
}

export default function ProfileCard({ variant, activePage, onClose }: ProfileCardProps) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const isDrop = variant === 'dropdown';
  const nameInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  function navigate(path: string) {
    onClose?.();
    router.push(path);
  }

  function handleLogout() {
    clearAuth();
    onClose?.();
    router.push('/login');
  }

  const iconClass = isDrop ? 'w-5 h-5 flex-shrink-0' : 'w-6 h-6 flex-shrink-0';
  const textClass = isDrop
    ? 'text-sm font-medium text-neutral-950'
    : 'text-base font-medium leading-[30px] tracking-[-0.03em] text-neutral-950';
  const btnClass = isDrop
    ? 'flex items-center gap-2 w-full justify-start cursor-pointer'
    : 'flex flex-row items-center gap-2 cursor-pointer';

  return (
    <div
      className={
        isDrop
          ? 'w-[197px] bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 flex flex-col gap-3'
          : 'hidden lg:flex flex-col gap-6 w-[240px] flex-shrink-0 bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-5'
      }
    >
      {/* User info */}
      <button onClick={() => navigate('/profile')} className='flex flex-row items-center gap-2 w-full text-left cursor-pointer'>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.name ?? ''}
            className={`rounded-full object-cover flex-shrink-0 ${isDrop ? 'w-9 h-9' : 'w-12 h-12'}`}
          />
        ) : (
          <div className={`rounded-full bg-neutral-300 flex-shrink-0 flex items-center justify-center ${isDrop ? 'w-9 h-9' : 'w-12 h-12'}`}>
            <span className={`font-bold text-neutral-950 ${isDrop ? 'text-sm' : 'text-base'}`}>
              {nameInitial}
            </span>
          </div>
        )}
        <span className={`font-bold text-neutral-950 ${isDrop ? 'text-base tracking-[-0.02em]' : 'text-lg leading-8 tracking-[-0.03em]'}`}>
          {user?.name ?? ''}
        </span>
      </button>

      <hr className={isDrop ? 'border-neutral-200' : 'border-t border-[#E9EAEB]'} />

      {/* Menu items */}
      <div className={`flex flex-col ${isDrop ? 'gap-3' : 'gap-6'}`}>
        {/* Delivery Address */}
        <button onClick={() => navigate('/')} className={btnClass}>
          <img src='/images/icons/map-pin.svg' alt='' className={iconClass} />
          <span className={textClass}>Delivery Address</span>
        </button>

        {/* My Orders */}
        {activePage === 'orders' ? (
          <div className='flex flex-row items-center gap-2'>
            <img
              src='/images/icons/my-orders.svg'
              alt=''
              className={iconClass}
              style={{ filter: 'brightness(0) saturate(100%) invert(18%) sepia(90%) saturate(4000%) hue-rotate(348deg) brightness(82%)' }}
            />
            <span className={`${isDrop ? 'text-sm font-medium' : 'text-base font-medium leading-[30px] tracking-[-0.03em]'} text-primary-100`}>
              My Orders
            </span>
          </div>
        ) : (
          <button onClick={() => navigate('/orders')} className={btnClass}>
            <img src='/images/icons/my-orders.svg' alt='' className={iconClass} />
            <span className={textClass}>My Orders</span>
          </button>
        )}

        {/* Logout */}
        <button onClick={handleLogout} className={btnClass}>
          <img src='/images/icons/logout.svg' alt='' className={iconClass} />
          <span className={textClass}>Logout</span>
        </button>
      </div>
    </div>
  );
}