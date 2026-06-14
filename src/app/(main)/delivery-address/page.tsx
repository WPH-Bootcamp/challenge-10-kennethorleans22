'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, X } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAddressStore, SavedAddress } from '@/store/address';
import ProfileCard from '@/components/shared/ProfileCard';
import Footer from '@/components/shared/Footer';

function AddressModal({
  existing,
  onClose,
}: {
  existing?: SavedAddress;
  onClose: () => void;
}) {
  const { addAddress, updateAddress } = useAddressStore();
  const [label, setLabel] = useState(existing?.label ?? '');
  const [address, setAddress] = useState(existing?.address ?? '');
  const [error, setError] = useState('');

  function handleSave() {
    if (!address.trim()) {
      setError('Alamat tidak boleh kosong');
      return;
    }
    if (existing) {
      updateAddress(existing.id, label.trim() || 'Alamat', address.trim());
    } else {
      addAddress(label.trim() || 'Alamat', address.trim());
    }
    onClose();
  }

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center px-4'
      style={{ background: 'rgba(10, 13, 18, 0.5)' }}
    >
      <div className='bg-white rounded-2xl p-4 lg:p-6 flex flex-col gap-4 lg:gap-6 w-full max-w-[400px]'>
        <div className='flex items-center justify-between'>
          <span className='text-xl font-extrabold leading-[34px] text-neutral-950'>
            {existing ? 'Edit Address' : 'Add Address'}
          </span>
          <button onClick={onClose} className='cursor-pointer'>
            <X className='w-6 h-6 text-neutral-950' />
          </button>
        </div>

        <div className='flex flex-col gap-3'>
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-bold text-neutral-950 leading-7'>
              Label (optional)
            </label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder='e.g. Home, Office'
              className='w-full h-11 border border-neutral-300 rounded-xl px-3 text-base font-normal text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-primary-100 transition-colors'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <label className='text-sm font-bold text-neutral-950 leading-7'>
              Delivery Address
            </label>
            <textarea
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(''); }}
              placeholder='Enter your full delivery address'
              rows={3}
              className='w-full border border-neutral-300 rounded-xl px-3 py-2 text-base font-normal text-neutral-950 placeholder:text-neutral-400 outline-none focus:border-primary-100 transition-colors resize-none'
            />
            {error && <p className='text-xs text-red-500'>{error}</p>}
          </div>
        </div>

        <button
          onClick={handleSave}
          className='w-full h-12 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
        >
          <span className='text-base font-bold text-neutral-25'>
            {existing ? 'Save Changes' : 'Add Address'}
          </span>
        </button>
      </div>
    </div>
  );
}

export default function DeliveryAddressPage() {
  const router = useRouter();
  const { token, _hasHydrated } = useAuthStore();
  const { addresses, deleteAddress, setDefault } = useAddressStore();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<SavedAddress | undefined>(undefined);

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [_hasHydrated, token, router]);

  if (!_hasHydrated) return null;
  if (!token) return null;

  function handleAdd() {
    setEditTarget(undefined);
    setShowModal(true);
  }

  function handleEdit(addr: SavedAddress) {
    setEditTarget(addr);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditTarget(undefined);
  }

  return (
    <div className='min-h-screen bg-neutral-50 flex flex-col'>
      {showModal && (
        <AddressModal existing={editTarget} onClose={handleCloseModal} />
      )}

      <main className='flex-1 pt-16 lg:pt-20'>
        <div className='px-4 pt-4 pb-8 flex flex-col gap-4 lg:px-0 lg:pt-12 lg:pb-12 lg:w-[1200px] lg:mx-auto lg:flex-row lg:gap-8 lg:items-start'>
          <ProfileCard variant='sidebar' activePage='delivery-address' />

          <div className='flex flex-col gap-4 lg:gap-6 flex-1'>
            <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
              Delivery Address
            </h1>

            <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-6 flex flex-col gap-4 lg:gap-5'>
              {addresses.length === 0 ? (
                <div className='flex flex-col items-center py-10 gap-3'>
                  <MapPin className='w-10 h-10 text-neutral-300' />
                  <p className='text-base font-medium text-neutral-500'>
                    No saved addresses yet.
                  </p>
                </div>
              ) : (
                <div className='flex flex-col gap-3 lg:gap-4'>
                  {addresses.map((addr, idx) => (
                    <div key={addr.id}>
                      <div className='flex items-start justify-between gap-3'>
                        <div className='flex items-start gap-3 flex-1 min-w-0'>
                          <button
                            onClick={() => setDefault(addr.id)}
                            className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${
                              addr.isDefault
                                ? 'border-primary-100'
                                : 'border-neutral-400'
                            }`}
                          >
                            {addr.isDefault && (
                              <div className='w-2.5 h-2.5 bg-primary-100 rounded-full' />
                            )}
                          </button>
                          <div className='flex flex-col gap-0.5 min-w-0'>
                            <div className='flex items-center gap-2'>
                              <span className='text-base font-extrabold text-neutral-950 leading-[30px] tracking-[-0.02em]'>
                                {addr.label}
                              </span>
                              {addr.isDefault && (
                                <span className='px-2 py-0.5 bg-[#FFECEC] text-primary-100 text-xs font-bold rounded-full'>
                                  Default
                                </span>
                              )}
                            </div>
                            <p className='text-sm lg:text-base font-normal text-neutral-950 tracking-[-0.02em] leading-7'>
                              {addr.address}
                            </p>
                          </div>
                        </div>
                        <div className='flex items-center gap-2 flex-shrink-0'>
                          <button
                            onClick={() => handleEdit(addr)}
                            className='h-9 px-4 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer'
                          >
                            <span className='text-sm font-bold text-neutral-950 tracking-[-0.02em]'>
                              Edit
                            </span>
                          </button>
                          <button
                            onClick={() => deleteAddress(addr.id)}
                            className='h-9 px-4 border border-neutral-300 rounded-full flex items-center justify-center cursor-pointer'
                          >
                            <span className='text-sm font-bold text-neutral-950 tracking-[-0.02em]'>
                              Delete
                            </span>
                          </button>
                        </div>
                      </div>
                      {idx < addresses.length - 1 && (
                        <hr className='border-t border-neutral-200 mt-3 lg:mt-4' />
                      )}
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleAdd}
                className='w-full h-11 lg:h-12 border border-dashed border-neutral-300 rounded-2xl flex items-center justify-center gap-2 cursor-pointer hover:border-primary-100 transition-colors group'
              >
                <MapPin className='w-5 h-5 text-neutral-400 group-hover:text-primary-100 transition-colors' />
                <span className='text-base font-bold text-neutral-400 group-hover:text-primary-100 tracking-[-0.02em] transition-colors'>
                  Add New Address
                </span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}