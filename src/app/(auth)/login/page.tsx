'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff } from 'lucide-react';

import { loginSchema, LoginFormValues } from '@/lib/validations/auth';
import { login } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const formValues = watch();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      router.push('/');
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    mutate(data);
  };

  return (
    <div className='min-h-screen flex'>
      <div className='hidden lg:block lg:w-1/2 relative'>
        <Image src='/images/login-bg.svg' alt='Food burger background' fill className='object-cover' priority />
      </div>

      <div className='flex-1 flex items-center justify-center p-6 bg-white'>
        <div className='w-full max-w-[374px] flex flex-col gap-4 lg:gap-5'>

          <div className='flex items-center gap-3 lg:gap-[15px]'>
            <Image src='/images/foody-logo.svg' alt='Foody logo' width={42} height={42} />
            <span className='font-extrabold text-2xl lg:text-[32px] leading-[42px] text-neutral-950'>Foody</span>
          </div>

          <div className='flex flex-col gap-1'>
            <h1 className='font-extrabold text-2xl lg:text-[28px] leading-9 lg:leading-[38px] text-neutral-950'>Welcome Back</h1>
            <p className='font-medium text-sm lg:text-base leading-7 lg:leading-[30px] tracking-[-0.03em] text-neutral-950'>
              Good to see you again! Let&apos;s eat
            </p>
          </div>

          <div className='flex items-center p-2 gap-2 bg-neutral-100 rounded-2xl h-12 lg:h-14'>
            <div className='flex-1 flex justify-center items-center px-3 py-2 bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-lg lg:rounded-xl'>
              <span className='font-bold text-sm lg:text-base leading-7 tracking-[-0.02em] text-neutral-950'>Sign in</span>
            </div>
            <Link href='/register' className='flex-1 flex justify-center items-center px-3 py-2'>
              <span className='font-medium text-sm lg:text-base leading-7 text-neutral-600'>Sign up</span>
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 lg:gap-5'>

            {/* Email */}
            <div className='flex flex-col gap-1'>
              <div className='h-14 border border-neutral-300 rounded-xl px-3 py-2 flex flex-col justify-center focus-within:border-primary-100 transition-colors'>
                {formValues.email && (
                  <span className='text-xs font-normal text-neutral-500 leading-4 tracking-[-0.02em]'>Email</span>
                )}
                <Input
                  {...register('email')}
                  type='email'
                  placeholder='Email'
                  className='border-0 bg-transparent text-base font-semibold text-neutral-950 tracking-[-0.02em] leading-[30px] placeholder:font-normal placeholder:text-neutral-500 focus-visible:ring-0 p-0 h-auto'
                />
              </div>
              {errors.email && (
                <p className='text-primary-100 text-sm font-semibold leading-7 tracking-[-0.02em]'>{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className='flex flex-col gap-1'>
              <div className='relative h-14 border border-neutral-300 rounded-xl px-3 py-2 flex flex-col justify-center focus-within:border-primary-100 transition-colors'>
                {formValues.password && (
                  <span className='text-xs font-normal text-neutral-500 leading-4 tracking-[-0.02em]'>Password</span>
                )}
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder='Password'
                  className='border-0 bg-transparent text-base font-semibold text-neutral-950 tracking-[-0.02em] leading-[30px] placeholder:font-normal placeholder:text-neutral-500 focus-visible:ring-0 p-0 h-auto pr-8'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-950'
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className='text-primary-100 text-sm font-semibold leading-7 tracking-[-0.02em]'>{errors.password.message}</p>
              )}
            </div>

            {/* Remember Me */}
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setRememberMe(!rememberMe)}
                className={`w-5 h-5 rounded-[6px] flex items-center justify-center border transition-colors ${
                  rememberMe ? 'bg-primary-100 border-primary-100' : 'bg-white border-neutral-300'
                }`}
              >
                {rememberMe && <Image src='/images/check-icon.svg' alt='check' width={12} height={12} />}
              </button>
              <span
                onClick={() => setRememberMe(!rememberMe)}
                className='font-medium text-sm lg:text-base leading-7 tracking-[-0.03em] text-neutral-950 cursor-pointer'
              >
                Remember Me
              </span>
            </div>

            {isError && (
              <p className='text-primary-100 text-sm font-semibold tracking-[-0.02em]'>
                Email or password is wrong. Please try again.
              </p>
            )}

            <Button
              type='submit'
              disabled={isPending}
              className='w-full h-12 bg-primary-100 rounded-full font-bold text-base leading-[30px] tracking-[-0.02em] text-neutral-25 hover:bg-primary-100/90 disabled:opacity-60'
            >
              {isPending ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}