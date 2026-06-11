"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";

import { registerSchema, RegisterFormValues } from "@/lib/validations/auth";
import { register as registerUser } from "@/lib/api/auth";
import { useAuthStore } from "@/store/auth";

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const { mutate, isPending, isError } = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      router.push("/");
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...payload } = values;
    mutate(payload);
  };

  return (
    <div className="min-h-screen flex">
      {/* Kiri: foto makanan — hanya muncul di desktop */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/images/login-bg.svg"
          alt="Food background"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* Kanan: area form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-[374px] flex flex-col gap-4 lg:gap-5">

          {/* Logo */}
          <div className="flex items-center gap-3 lg:gap-[15px]">
            <Image
              src="/images/foody-logo.svg"
              alt="Foody logo"
              width={42}
              height={42}
            />
            <span className="font-extrabold text-2xl lg:text-[32px] leading-[42px] text-[#0A0D12]">
              Foody
            </span>
          </div>

          {/* Judul */}
          <div className="flex flex-col gap-1">
            <h1 className="font-extrabold text-2xl lg:text-[28px] leading-9 lg:leading-[38px] text-[#0A0D12]">
              Welcome Back
            </h1>
            <p className="font-medium text-sm lg:text-base leading-7 lg:leading-[30px] tracking-[-0.03em] text-[#0A0D12]">
              Good to see you again! Let&apos;s eat
            </p>
          </div>

          {/* Tab Sign in / Sign up */}
          <div className="flex items-center p-2 gap-2 bg-[#F5F5F5] rounded-2xl h-12 lg:h-14">
            {/* Sign in: tidak aktif — link ke login */}
            <Link
              href="/login"
              className="flex-1 flex justify-center items-center px-3 py-2"
            >
              <span className="font-medium text-sm lg:text-base leading-7 text-[#535862]">
                Sign in
              </span>
            </Link>
            {/* Sign up: aktif — putih, ada shadow */}
            <div className="flex-1 flex justify-center items-center px-3 py-2 bg-white shadow-[0px_0px_20px_rgba(203,202,202,0.25)] rounded-lg lg:rounded-xl">
              <span className="font-bold text-sm lg:text-base leading-7 tracking-[-0.02em] text-[#0A0D12]">
                Sign up
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 lg:gap-5">

            {/* Field Name */}
            <div className="flex flex-col gap-1">
              <input
                {...register("name")}
                type="text"
                placeholder="Name"
                className="w-full h-12 lg:h-14 px-3 py-2 border border-[#D5D7DA] rounded-xl text-sm lg:text-base font-normal leading-7 tracking-[-0.02em] text-[#0A0D12] placeholder:text-[#717680] outline-none focus:border-[#C12116] transition-colors"
              />
              {errors.name && (
                <p className="text-[#C12116] text-sm font-semibold leading-7 tracking-[-0.02em]">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Field Email */}
            <div className="flex flex-col gap-1">
              <input
                {...register("email")}
                type="email"
                placeholder="Email"
                className="w-full h-12 lg:h-14 px-3 py-2 border border-[#D5D7DA] rounded-xl text-sm lg:text-base font-normal leading-7 tracking-[-0.02em] text-[#0A0D12] placeholder:text-[#717680] outline-none focus:border-[#C12116] transition-colors"
              />
              {errors.email && (
                <p className="text-[#C12116] text-sm font-semibold leading-7 tracking-[-0.02em]">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Field Phone */}
            <div className="flex flex-col gap-1">
              <input
                {...register("phone")}
                type="tel"
                placeholder="Number Phone"
                className="w-full h-12 lg:h-14 px-3 py-2 border border-[#D5D7DA] rounded-xl text-sm lg:text-base font-normal leading-7 tracking-[-0.02em] text-[#0A0D12] placeholder:text-[#717680] outline-none focus:border-[#C12116] transition-colors"
              />
              {errors.phone && (
                <p className="text-[#C12116] text-sm font-semibold leading-7 tracking-[-0.02em]">
                  {errors.phone.message}
                </p>
              )}
            </div>

            {/* Field Password */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full h-12 lg:h-14 px-3 py-2 pr-10 border border-[#D5D7DA] rounded-xl text-sm lg:text-base font-normal leading-7 tracking-[-0.02em] text-[#0A0D12] placeholder:text-[#717680] outline-none focus:border-[#C12116] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0D12]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[#C12116] text-sm font-semibold leading-7 tracking-[-0.02em]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Field Confirm Password */}
            <div className="flex flex-col gap-1">
              <div className="relative">
                <input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full h-12 lg:h-14 px-3 py-2 pr-10 border border-[#D5D7DA] rounded-xl text-sm lg:text-base font-normal leading-7 tracking-[-0.02em] text-[#0A0D12] placeholder:text-[#717680] outline-none focus:border-[#C12116] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0A0D12]"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[#C12116] text-sm font-semibold leading-7 tracking-[-0.02em]">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Error dari API */}
            {isError && (
              <p className="text-[#C12116] text-sm font-semibold tracking-[-0.02em]">
               Registration failed. Email might be registered.
              </p>
            )}

            {/* Tombol Register */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-12 bg-[#C12116] rounded-full font-bold text-base leading-[30px] tracking-[-0.02em] text-[#FDFDFD] hover:bg-[#a51c12] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Loading..." : "Register"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}