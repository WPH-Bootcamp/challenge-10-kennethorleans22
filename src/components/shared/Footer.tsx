'use client';

import Image from 'next/image';

const exploreLinks = ['All Food', 'Nearby', 'Discount', 'Best Seller', 'Delivery', 'Lunch'];
const helpLinks = ['How to Order', 'Payment Methods', 'Track My Order', 'FAQ', 'Contact Us'];
const socialLinks = [
  { name: 'Facebook', icon: '/images/socials/facebook.svg', href: 'https://www.facebook.com' },
  { name: 'Instagram', icon: '/images/socials/instagram.svg', href: 'https://www.instagram.com' },
  { name: 'LinkedIn', icon: '/images/socials/linkedin.svg', href: 'https://www.linkedin.com' },
  { name: 'TikTok', icon: '/images/socials/tiktok.svg', href: 'https://www.tiktok.com' },
];
export default function Footer() {
  return (
    <footer className='bg-neutral-950 border-t border-neutral-300 px-4 lg:px-[120px] py-10 lg:py-[80px] flex flex-col lg:flex-row lg:justify-between gap-6 lg:gap-0'>

      {/* Kolom kiri: Foody */}
      <div className='flex flex-col gap-4 lg:gap-[40px] lg:w-[380px] shrink-0'>
        <div className='flex flex-col gap-[22px]'>
          <div className='flex items-center gap-[15px]'>
            <Image src='/images/foody-logo.svg' alt='Foody' width={42} height={42} />
            <span className='text-[32px] font-extrabold leading-[42px] text-white'>Foody</span>
          </div>
          <p className='text-sm lg:text-base font-normal text-neutral-25 tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
            Enjoy homemade flavors & chef&apos;s signature dishes, freshly prepared every day. Order online or visit our nearest branch.
          </p>
        </div>
        <div className='flex flex-col gap-5'>
          <span className='text-sm lg:text-base font-extrabold text-neutral-25'>
            Follow on Social Media
          </span>
     <div className='flex items-center gap-3'>
  {socialLinks.map((social) => (
    <a
      key={social.name}
      href={social.href}
      target='_blank'
      rel='noopener noreferrer'
      className='w-10 h-10 rounded-full border border-neutral-800 flex items-center justify-center cursor-pointer'
    >
      <img src={social.icon} alt={social.name} className='w-5 h-5 object-contain' />
    </a>
  ))}
</div>
        </div>
      </div>

      {/* Kolom tengah: Explore */}
      <div className='flex flex-col gap-4 lg:gap-5 lg:w-[200px]'>
        <span className='text-sm lg:text-base font-extrabold text-neutral-25'>Explore</span>
        {exploreLinks.map((link) => (
          <span key={link} className='text-sm lg:text-base font-normal text-neutral-25 tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
            {link}
          </span>
        ))}
      </div>

      {/* Kolom kanan: Help */}
      <div className='flex flex-col gap-4 lg:gap-5 lg:w-[200px]'>
        <span className='text-sm lg:text-base font-extrabold text-neutral-25'>Help</span>
        {helpLinks.map((link) => (
          <span key={link} className='text-sm lg:text-base font-normal text-neutral-25 tracking-[-0.02em] leading-[28px] lg:leading-[30px]'>
            {link}
          </span>
        ))}
      </div>

    </footer>
  );
}