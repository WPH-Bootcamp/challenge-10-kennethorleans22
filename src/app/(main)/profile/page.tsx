'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil } from 'lucide-react';
import Footer from '@/components/shared/Footer';
import ProfileCard from '@/components/shared/ProfileCard';
import { useAuthStore } from '@/store/auth';
import { useUpdateProfile } from '@/lib/query/profile';

export default function ProfilePage() {
  const router = useRouter();
  const { token, user, _hasHydrated, setAuth } = useAuthStore();
  const { mutateAsync: saveProfile, isPending } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nameInitial = user?.name?.charAt(0).toUpperCase() ?? 'U';
  const displayAvatar = avatarPreview ?? user?.avatar ?? null;

  useEffect(() => {
    if (_hasHydrated && !token) router.push('/login');
  }, [_hasHydrated, token, router]);

  if (!_hasHydrated) return null;
  if (!token) return null;

  function handleStartEdit() {
    setEditName(user?.name ?? '');
    setEditEmail(user?.email ?? '');
    setEditPhone(user?.phone ?? '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(true);
  }

  function handleCancel() {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
  }

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    const formData = new FormData();
    formData.append('name', editName);
    formData.append('email', editEmail);
    formData.append('phone', editPhone);
    if (avatarFile) formData.append('avatar', avatarFile);

    try {
      const updatedUser = await saveProfile(formData);
      setAuth(token!, updatedUser);
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      console.error(err);
    }
  }

  const labelClass = 'font-medium text-sm lg:text-base leading-7 lg:leading-[30px] lg:tracking-[-0.03em] text-neutral-950';
  const valueClass = 'font-bold text-sm lg:text-base leading-7 lg:leading-[30px] tracking-[-0.02em] text-neutral-950';
  const inputClass = `${valueClass} text-right border-b border-neutral-300 outline-none bg-transparent min-w-0 max-w-[60%]`;

  return (
    <div className='min-h-screen bg-neutral-50 flex flex-col'>
      <main className='flex-1 pt-16 lg:pt-20'>
        <div className='px-4 pt-4 pb-8 flex flex-col gap-4 lg:px-0 lg:pt-12 lg:pb-12 lg:w-[1200px] lg:mx-auto lg:flex-row lg:gap-8 lg:items-start'>
          <ProfileCard variant='sidebar' />
          <div className='flex flex-col gap-4 lg:gap-6 lg:max-w-[524px] flex-1'>
            <h1 className='text-2xl lg:text-[32px] font-extrabold leading-9 lg:leading-[42px] text-neutral-950'>
              Profile
            </h1>
            <div className='bg-white rounded-2xl shadow-[0px_0px_20px_rgba(203,202,202,0.25)] p-4 lg:p-5 flex flex-col gap-6'>
              <div className='flex flex-col gap-2 lg:gap-3'>
                {/* Avatar */}
                <div className='relative w-16 h-16'>
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={user?.name ?? ''}
                      className='w-16 h-16 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-16 h-16 rounded-full bg-neutral-300 flex items-center justify-center'>
                      <span className='font-bold text-neutral-950 text-base'>{nameInitial}</span>
                    </div>
                  )}
                  {isEditing && (
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='absolute bottom-0 right-0 w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
                    >
                      <Pencil className='w-3 h-3 text-white' />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='image/*'
                    className='hidden'
                    onChange={handleAvatarChange}
                  />
                </div>

                {/* Name */}
                <div className='flex flex-row justify-between items-center'>
                  <span className={labelClass}>Name</span>
                  {isEditing ? (
                    <input
                      type='text'
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <span className={valueClass}>{user?.name ?? '-'}</span>
                  )}
                </div>

                {/* Email */}
                <div className='flex flex-row justify-between items-center'>
                  <span className={labelClass}>Email</span>
                  {isEditing ? (
                    <input
                      type='email'
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <span className={valueClass}>{user?.email ?? '-'}</span>
                  )}
                </div>

                {/* Phone */}
                <div className='flex flex-row justify-between items-center'>
                  <span className={labelClass}>Nomor Handphone</span>
                  {isEditing ? (
                    <input
                      type='tel'
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <span className={valueClass}>{user?.phone ?? '-'}</span>
                  )}
                </div>
              </div>

              {isEditing ? (
                <div className='flex flex-row gap-3'>
                  <button
                    type='button'
                    onClick={handleCancel}
                    disabled={isPending}
                    className='flex-1 h-11 border border-primary-100 rounded-full flex items-center justify-center cursor-pointer'
                  >
                    <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-primary-100'>
                      Cancel
                    </span>
                  </button>
                  <button
                    type='button'
                    onClick={handleSave}
                    disabled={isPending}
                    className='flex-1 h-11 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-70'
                  >
                    <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
                      {isPending ? 'Saving...' : 'Save'}
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  type='button'
                  onClick={handleStartEdit}
                  className='w-full h-11 bg-primary-100 rounded-full flex items-center justify-center cursor-pointer'
                >
                  <span className='text-base font-bold leading-[30px] tracking-[-0.02em] text-neutral-25'>
                    Change Profile
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}