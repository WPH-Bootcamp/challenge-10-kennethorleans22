[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Td2-SxZf)
# Assignment 10 - Restaurant App

Hallo team, berikut saya bantu buatkan dokumen, agar kalian lebih mudah dalam pengerjaan project ini ya, baca dokumen ini sampai selesai sebelum mulai ngoding.
Dokumen ini menjelaskan apa yang harus dibangun, batasan teknis, saran struktur project,
serta cara penilaiannya. Implementasi tetap kalian kerjakan sendiri.

---

## 1. Ringkasan

Kalian akan membangun sebuah **Restaurant App** (aplikasi pemesanan makanan) dari awal
menggunakan data asli dari REST API yang sudah disediakan. Aplikasi harus mengikuti
desain di Figma dan menjalankan flow user secara utuh: lihat daftar restoran, filter,
lihat detail menu, masuk ke cart, checkout, sampai melihat history pesanan.

Fokus assignment ini bukan sekadar "tampilan jadi", tapi bagaimana kalian:

- Memisahkan **server state** dan **client/UI state** dengan benar.
- Menerapkan **best practice Next.js** (App Router, struktur, rendering).
- Menulis **TypeScript** yang rapi dan aman dari sisi tipe.

---

## 2. Tujuan Pembelajaran

Setelah menyelesaikan assignment ini kalian diharapkan paham:

- Cara fetching, caching, dan invalidasi data server dengan TanStack Query.
- Kapan memakai global client state (Zustand) dan kapan tidak.
- Validasi form dan input dengan Zod + React Hook Form.
- Membangun UI yang konsisten memakai komponen shadcn/ui + Tailwind.
- Struktur folder dan pola kode yang scalable di Next.js App Router.

---

## 3. Tech Stack Wajib

Stack berikut wajib dipakai. Tidak boleh diganti dengan alternatif lain.

| Kebutuhan                    | Tools                        |
| ---------------------------- | ---------------------------- |
| Framework                    | Next.js (App Router)         |
| Bahasa                       | TypeScript (strict)          |
| Server state / data fetching | TanStack Query (React Query) |
| HTTP client                  | Axios                        |
| Client / UI state            | Zustand                      |
| Form                         | React Hook Form              |
| Validasi schema              | Zod                          |
| Komponen UI                  | shadcn/ui                    |
| Styling                      | Tailwind CSS                 |

Catatan: project ini sudah di-bootstrap dengan Next.js + TypeScript + Tailwind.
Library lain di atas belum terpasang, jadi kalian yang install dan setup sendiri.

---

## 4. Resource

- Figma desain: https://www.figma.com/design/mOJNvaD7zbyo5ZPdMEehOo/Restaurant-App---assignment-10
- API base URL: `https://be-restaurant-production.up.railway.app`
- API docs (Swagger): https://be-restaurant-production.up.railway.app/api-swagger/

Semua endpoint diawali prefix `/api`. Untuk endpoint yang butuh login, kirim header:

```
Authorization: Bearer <token>
```

Token didapat dari response login/register dan harus disimpan (lihat catatan di bagian
state management soal di mana menyimpannya).

Gunakan **Axios** sebagai HTTP client. Buat satu instance terpusat (mis. di
`lib/api/axios.ts`) dengan `baseURL` dari environment variable, lalu pasang token
lewat interceptor (request interceptor untuk menyisipkan header `Authorization`,
response interceptor untuk handling error global mis. 401). Jangan memanggil `axios`
mentah berulang-ulang di banyak komponen.

---

## 5. Ringkasan Endpoint API

Ini ringkasan endpoint utama supaya kalian punya gambaran. Detail lengkap field dan
response tetap cek di Swagger. Tanda (auth) artinya butuh Bearer token.

### Auth

- `POST /api/auth/register` - body: `name`, `email`, `phone`, `password`
- `POST /api/auth/login` - body: `email`, `password`
- `GET /api/auth/profile` (auth)
- `PUT /api/auth/profile` (auth)

### Restoran dan Menu

- `GET /api/resto` - daftar restoran dengan filter query: `location`, `range`, `priceMin`, `priceMax`, `rating`, `category`, `page`, `limit`
- `GET /api/resto/{id}` - detail restoran + menu + review. Query: `limitMenu`, `limitReview`
- `GET /api/resto/search` - cari by nama. Query: `q`, `page`, `limit`
- `GET /api/resto/best-seller` - urut rating tertinggi. Query: `page`, `limit`
- `GET /api/resto/recommended` (auth)
- `GET /api/resto/nearby` (auth) - query: `range`, `limit`

### Cart (auth)

- `GET /api/cart` - isi cart dikelompokkan per restoran
- `POST /api/cart` - body: `restaurantId`, `menuId`, `quantity`
- `PUT /api/cart/{id}` - body: `quantity`
- `DELETE /api/cart/{id}` - hapus 1 item
- `DELETE /api/cart` - kosongkan seluruh cart

### Order / Checkout (auth)

- `POST /api/order/checkout` - body: `restaurants` (array berisi `restaurantId` dan `items[{ menuId, quantity }]`), `deliveryAddress`, opsional `phone`, `paymentMethod`, `notes`
- `GET /api/order/my-order` - history pesanan. Query: `status`, `page`, `limit`

### Review (auth)

- `POST /api/review` - body: `transactionId`, `restaurantId`, `star`, `comment`, opsional `menuIds`
- `GET /api/review/my-reviews`
- `GET /api/review/restaurant/{restaurantId}`
- `PUT /api/review/{id}` dan `DELETE /api/review/{id}`

---

## 6. Fitur MVP yang Harus Dibuat

Berikut flow minimal yang wajib jalan tanpa bug fatal. Acceptance criteria di tiap
fitur dipakai sebagai acuan kapan fitur dianggap "selesai".

### 6.1 Autentikasi

- Halaman Register dan Login sesuai Figma.
- Validasi form pakai React Hook Form + Zod (email valid, password minimal sekian
  karakter, konfirmasi password jika ada di desain, dll).
- Setelah login berhasil, token tersimpan dan user diarahkan ke halaman utama.
- Ada handling error (mis. email sudah terpakai, password salah) yang tampil ke user.
- Route yang butuh login (cart, checkout, profile, history) tidak bisa diakses
  tanpa token, redirect ke login.

### 6.2 Home / Daftar Restoran

- Menampilkan daftar restoran dari `GET /api/resto`.
- Section sesuai Figma (mis. recommended, best seller, kategori).
- Ada loading state dan empty state, bukan layar kosong.

### 6.3 Filter dan Search

- Filter berfungsi memakai query param yang tersedia (kategori, rating, harga,
  jarak, dsb sesuai desain).
- Search restoran by nama jalan.
- State filter sebaiknya terbaca dari URL (lihat bagian routing) agar bisa di-share
  dan tidak hilang saat refresh.

### 6.4 Detail Restoran

- Menampilkan detail restoran + daftar menu + review dari `GET /api/resto/{id}`.
- Tombol untuk menambah menu ke cart (atur quantity).

### 6.5 Cart

- Menampilkan isi cart dari `GET /api/cart`, dikelompokkan per restoran.
- Tambah, ubah quantity, hapus item, dan kosongkan cart bekerja.
- Total harga terhitung benar.
- UI ter-update setelah aksi (perhatikan invalidasi query, jangan manual setState
  yang bikin data tidak sinkron dengan server).

### 6.6 Checkout

- Form alamat pengiriman + metode pembayaran + catatan sesuai desain, divalidasi
  dengan Zod.
- Submit ke `POST /api/order/checkout` dengan struktur `restaurants` yang benar.
- Setelah sukses, user dapat konfirmasi dan diarahkan ke history / success page.

### 6.7 History Pesanan

- Menampilkan pesanan user dari `GET /api/order/my-order`.
- Bisa filter berdasarkan status jika ada di desain.
- Bonus (jika sempat dan ada di desain): beri review untuk pesanan yang sudah selesai.

---

## 7. Saran Struktur Folder

Ini saran, bukan aturan mati, tapi struktur kalian harus jelas dan konsisten.
Pakai App Router. Pisahkan layer fetching, state, komponen, dan tipe.

```
src/
  app/
    (auth)/
      login/page.tsx
      register/page.tsx
    (main)/
      page.tsx                 # home / daftar restoran
      resto/[id]/page.tsx      # detail restoran
      cart/page.tsx
      checkout/page.tsx
      orders/page.tsx          # history
    layout.tsx
    globals.css
    providers.tsx              # QueryClientProvider dan provider lain
  components/
    ui/                        # komponen hasil shadcn (button, input, dialog, dst)
    shared/                    # komponen reusable milik kalian (navbar, footer, card)
  features/                    # opsional, kelompokkan per domain
    resto/
    cart/
    order/
  lib/
    api/
      axios.ts                 # instance axios terpusat + interceptor
      resto.ts                 # fungsi pemanggil endpoint resto (pakai instance axios)
      cart.ts
      order.ts
    query/                     # query keys, custom hooks useQuery/useMutation
    validations/               # schema Zod
    utils.ts
  store/                       # store Zustand (mis. auth, ui)
  types/                       # tipe TypeScript bersama
```

Catatan: boleh memakai pola "feature-based" (semua yang berkaitan satu domain
dikumpulkan dalam satu folder) atau "type-based" seperti di atas. Yang penting
konsisten dan mudah ditelusuri.

---

## 8. Panduan State Management (penting, bobot besar)

Ini bagian yang paling sering salah, dan bobotnya 30 persen. Pahami baik-baik.

**Server state = data milik server.** Semua yang datang dari API (daftar restoran,
detail, isi cart, history) adalah server state. Ini wajib dikelola TanStack Query.

- Gunakan `useQuery` untuk read, `useMutation` untuk create/update/delete.
- Buat **query keys** yang konsisten dan terstruktur.
- Setelah mutation sukses (mis. tambah ke cart), lakukan `invalidateQueries`
  agar data ulang fetch dan UI sinkron. Jangan menyalin data server ke Zustand.
- Manfaatkan loading, error, dan empty state bawaan query di UI.

**Client / UI state = data milik aplikasi di sisi browser.** Contoh: status
sidebar/drawer terbuka, filter sementara sebelum di-apply, dan token auth.
Ini yang boleh masuk Zustand.

- Jangan menyimpan list restoran atau isi cart hasil fetch ke Zustand.
- Token auth boleh disimpan di Zustand (dengan persist) atau cookie. Pilih satu
  pendekatan dan konsisten.

Aturan praktis: kalau datanya berasal dari server dan bisa berubah di server,
itu TanStack Query. Kalau murni state tampilan/sesi di browser, itu Zustand.

---

## 9. Best Practice Routing dan Rendering Next.js (bobot 20 persen)

- Pakai **App Router** (`src/app`), bukan Pages Router.
- Manfaatkan **route groups** dan layout untuk bagian yang berbagi UI (mis. navbar).
- Gunakan **loading.tsx** dan **error.tsx** per segment bila relevan.
- Bedakan **Server Component** dan **Client Component**. Tambahkan `"use client"`
  hanya di komponen yang butuh hook/interaktivitas. Jangan menaruhnya di paling atas
  tree tanpa alasan.
- Halaman yang butuh proteksi auth harus benar-benar terjaga (redirect bila tidak ada
  token), bukan hanya menyembunyikan tombol.
- State filter dan pagination idealnya tersimpan di URL (search params), bukan hanya
  di memori, supaya bisa di-refresh dan di-share.
- Gunakan komponen `next/image` dan `next/link` sesuai peruntukannya.

---

## 10. Setup Awal

Project sudah berisi Next.js + TypeScript + Tailwind. Yang perlu kalian lakukan:

1. Install library yang belum ada (TanStack Query, Axios, Zustand, React Hook Form,
   Zod, resolver Zod untuk RHF, dan inisialisasi shadcn/ui). Cek dokumentasi resmi
   masing-masing untuk perintah install dan setup terbaru.
2. Setup `QueryClientProvider` (disarankan di file provider terpisah lalu dipakai
   di `layout.tsx`).
3. Inisialisasi shadcn/ui dan tambahkan komponen sesuai kebutuhan.
4. Simpan base URL API di environment variable (`.env`), jangan hardcode di banyak
   tempat. Contoh: `NEXT_PUBLIC_API_BASE_URL`.

### Bersihkan file bawaan yang tidak dipakai

Next.js membawa beberapa file contoh. Hapus atau ganti yang tidak relevan agar
project bersih:

- Isi default di `src/app/page.tsx` (ganti dengan halaman kalian sendiri).
- Boilerplate di `README.md` lama (sudah diganti dokumen ini).
- Aset contoh di `public/` yang tidak dipakai: `next.svg`, `vercel.svg`,
  `file.svg`, `globe.svg`, `window.svg`.
- Style contoh di `globals.css` yang tidak terpakai.

Perintah dasar:

```bash
npm run dev      # menjalankan dev server
npm run build    # build production
npm run lint     # cek lint
```

---

## 11. Tips dan Hal yang Dinilai

- Konsisten dengan desain Figma: spacing, warna, font, dan komponen.
- Jangan ada `any` yang tidak perlu. Tipe response API dibuat sebagai interface/type.
- Tangani semua state UI: loading, error, empty, dan success.
- Beri feedback ke user setiap aksi (toast/notifikasi sukses dan gagal).
- Commit yang rapi dan bertahap, bukan satu commit besar di akhir.
- Hindari prop drilling berlebihan dan komponen yang terlalu besar. Pecah jadi
  komponen kecil yang reusable.
- Jangan menaruh logic fetching langsung di dalam komponen UI. Bungkus dalam
  custom hook (mis. `useRestaurants`, `useCart`).
- fokus pada detail dan kerjakan fokus 1 fitur dengan fokus dulu

---

## 12. Rubrik Penilaian

| Aspek                               | Bobot     | Kriteria                                                                                                              |
| ----------------------------------- | --------- | --------------------------------------------------------------------------------------------------------------------- |
| Implementasi Fungsionalitas MVP     | 40 persen | Seluruh fitur utama Restaurant App berjalan sesuai flow user (menu, filter, cart, checkout, history) tanpa bug fatal. |
| State Management dan Data Fetching  | 30 persen | Pemisahan server state (TanStack Query) dan client/UI state (Zustand) dilakukan dengan benar, konsisten, dan optimal. |
| Routing dan Rendering Flow          | 20 persen | Penggunaan best practice di Next.js (App Router, server/client component, proteksi route, search params).             |
| Code Quality, UI, dan Best Practice | 10 persen | Code TypeScript rapi, struktur project jelas, UI konsisten dengan Figma, dan mengikuti best practice frontend modern. |

Total: 100 persen.

Selamat mengerjakan. Kalau ada yang tidak jelas pada flow atau API, baca dulu Swagger
dan Figma, lalu tanyakan ke mentor.
