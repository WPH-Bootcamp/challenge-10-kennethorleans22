'use client';

import Image from 'next/image';

const exploreLinks = ['All Food', 'Nearby', 'Discount', 'Best Seller', 'Delivery', 'Lunch'];
const helpLinks = ['How to Order', 'Payment Methods', 'Track My Order', 'FAQ', 'Contact Us'];
const socialLinks = [
  { name: 'Facebook', icon: '/images/socials/facebook.svg' },
  { name: 'Instagram', icon: '/images/socials/instagram.svg' },
  { name: 'LinkedIn', icon: '/images/socials/linkedin.svg' },
  { name: 'TikTok', icon: '/images/socials/tiktok.svg' },
];

export default function Footer() {
  return (
    <footer className='bg-[#0A0D12] border-t border-[#D5D7DA] px-4 lg:px-[120px] py-10 lg:py-[80px] flex flex-col lg:flex-row gap-6 lg:gap-[69px]'>
      {/* Kiri: Logo + deskripsi + sosmed */}
      <div className='flex flex-col gap-4 lg:gap-[40px] lg:w-[380px] shrink-0'>
        {/* Logo + deskripsi */}
        <div className='flex flex-col gap-[22px]'>
          <div className='flex items-center gap-[15px]'>
            <Image src='/images/foody-logo.svg' alt='Foody' width={42} height={42} />
            <span className='text-[32px] font-extrabold leading-[42px] text-white'>
              Foody
            </span>
          </div>
          <p className='text-sm lg:text-base font-normal text-[#FDFDFD] tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
            Enjoy homemade flavors & chef&apos;s signature dishes, freshly prepared every day. Order online or visit our nearest branch.
          </p>
        </div>
        {/* Social media */}
        <div className='flex flex-col gap-5'>
          <span className='text-sm lg:text-base font-bold lg:font-extrabold text-[#FDFDFD] tracking-[-0.02em]'>
            Follow on Social Media
          </span>
        <div className='flex items-center gap-3'>
  {socialLinks.map((social) => (
    <div
      key={social.name}
      className='w-10 h-10 rounded-full border border-[#252B37] flex items-center justify-center'
    >
      <img src={social.icon} alt={social.name} className='w-5 h-5 object-contain' />
    </div>
  ))}
</div>
        </div>
      </div>

      {/* Kanan: Link kolom */}
      <div className='flex gap-4 flex-1'>
        {/* Explore */}
        <div className='flex flex-col gap-4 lg:gap-5 flex-1'>
          <span className='text-sm lg:text-base font-extrabold text-[#FDFDFD]'>Explore</span>
          {exploreLinks.map((link) => (
            <span key={link} className='text-sm lg:text-base font-normal text-[#FDFDFD] tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
              {link}
            </span>
          ))}
        </div>
        {/* Help */}
        <div className='flex flex-col gap-4 lg:gap-5 flex-1'>
          <span className='text-sm lg:text-base font-extrabold text-[#FDFDFD]'>Help</span>
          {helpLinks.map((link) => (
            <span key={link} className='text-sm lg:text-base font-normal text-[#FDFDFD] tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
              {link}
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}