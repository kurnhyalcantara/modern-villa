import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  BookingStatus,
  PaymentStatus,
  PaymentMethod,
  TransactionStatus,
  UserRole,
} from '@/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const SALT_ROUNDS = 12;

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

async function createAuthUser(email: string, password: string) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error)
    throw new Error(`Failed to create auth user ${email}: ${error.message}`);
  return data.user;
}

async function main() {
  // ============================================
  // Cleanup existing data
  // ============================================
  await prisma.translationValue.deleteMany();
  await prisma.translationKey.deleteMany();
  await prisma.language.deleteMany();
  await prisma.adminLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.withdrawal.deleteMany();
  await prisma.deposit.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.villaImage.deleteMany();
  await prisma.villa.deleteMany();
  await prisma.user.deleteMany();

  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
  for (const u of existingUsers.users) {
    await supabaseAdmin.auth.admin.deleteUser(u.id);
  }

  // ============================================
  // Users
  // ============================================
  const adminPassword = await bcrypt.hash('admin123', SALT_ROUNDS);
  const userPassword = await bcrypt.hash('password123', SALT_ROUNDS);

  await createAuthUser('admin@modernvilla.com', 'admin123');
  await createAuthUser('sarah.jones@email.com', 'password123');
  await createAuthUser('michael.chen@email.com', 'password123');
  await createAuthUser('emma.wilson@email.com', 'password123');
  await createAuthUser('david.park@email.com', 'password123');

  const admin = await prisma.user.create({
    data: {
      email: 'admin@modernvilla.com',
      password: adminPassword,
      fullName: 'System Administrator',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: UserRole.ADMIN,
      balance: 0,
    },
  });

  const user1 = await prisma.user.create({
    data: {
      email: 'sarah.jones@email.com',
      password: userPassword,
      fullName: 'Sarah Jones',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: UserRole.USER,
      balance: 5000,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'michael.chen@email.com',
      password: userPassword,
      fullName: 'Michael Chen',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: UserRole.USER,
      balance: 2500,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'emma.wilson@email.com',
      password: userPassword,
      fullName: 'Emma Wilson',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      role: UserRole.USER,
      balance: 0,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'david.park@email.com',
      password: userPassword,
      fullName: 'David Park',
      role: UserRole.USER,
      balance: 1200,
    },
  });

  // ============================================
  // Villas
  // ============================================
  const villa1 = await prisma.villa.create({
    data: {
      title: 'Sunset Cliff Villa',
      slug: 'sunset-cliff-villa',
      description:
        'Perched on a dramatic cliff overlooking the Indian Ocean, this stunning villa offers panoramic sunset views from every room. Features a private infinity pool, open-air living spaces, and a dedicated butler service. Perfect for those seeking luxury and tranquility.',
      location: 'Uluwatu, Bali',
      pricePerNight: 450,
      maxGuests: 6,
      rating: 4.8,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200',
            order: 1,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
            order: 2,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
            order: 3,
          },
        ],
      },
    },
  });

  const villa2 = await prisma.villa.create({
    data: {
      title: 'Tropical Garden Retreat',
      slug: 'tropical-garden-retreat',
      description:
        'Nestled in the heart of Ubud rice terraces, this peaceful retreat is surrounded by lush tropical gardens and flowing water features. Traditional Balinese architecture meets modern comfort with a private plunge pool and outdoor bathtub.',
      location: 'Ubud, Bali',
      pricePerNight: 280,
      maxGuests: 4,
      rating: 4.6,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200',
            order: 1,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200',
            order: 2,
          },
        ],
      },
    },
  });

  const villa3 = await prisma.villa.create({
    data: {
      title: 'Luxury Beachfront Suite',
      slug: 'luxury-beachfront-suite',
      description:
        'Step directly onto the white sand from your private terrace. This beachfront masterpiece offers direct ocean access, a private infinity pool, and floor-to-ceiling glass walls that blur the line between indoor luxury and tropical paradise.',
      location: 'Seminyak, Bali',
      pricePerNight: 650,
      maxGuests: 8,
      rating: 4.9,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200',
            order: 1,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
            order: 2,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200',
            order: 3,
          },
        ],
      },
    },
  });

  const villa4 = await prisma.villa.create({
    data: {
      title: 'Mountain View Chalet',
      slug: 'mountain-view-chalet',
      description:
        'A cozy yet sophisticated mountain retreat with breathtaking views of Mount Agung. Features a stone fireplace, heated infinity pool, and floor-to-ceiling windows that frame the volcano perfectly at sunrise.',
      location: 'Kintamani, Bali',
      pricePerNight: 320,
      maxGuests: 5,
      rating: 4.7,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600585154526-41f5dd9d1d5c?w=1200',
            order: 1,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600607687644-c717b893a931?w=1200',
            order: 2,
          },
        ],
      },
    },
  });

  const villa5 = await prisma.villa.create({
    data: {
      title: 'Jungle Treehouse Escape',
      slug: 'jungle-treehouse-escape',
      description:
        'Experience Bali from the canopy in this architecturally stunning treehouse villa. Suspended among ancient banyan trees with a glass-bottom floor section and an open-air rooftop deck for stargazing.',
      location: 'Sidemen, Bali',
      pricePerNight: 195,
      maxGuests: 3,
      rating: 4.5,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.villa.create({
    data: {
      title: 'Oceanfront Penthouse',
      slug: 'oceanfront-penthouse',
      description:
        'The pinnacle of coastal luxury. This expansive penthouse spans two floors with a private rooftop terrace, jacuzzi, and 360-degree ocean views. Features smart home automation and a private chef upon request.',
      location: 'Canggu, Bali',
      pricePerNight: 890,
      maxGuests: 10,
      rating: 5.0,
      images: {
        create: [
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600585154363-67eb9e2e2099?w=1200',
            order: 0,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200',
            order: 1,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200',
            order: 2,
          },
          {
            imageUrl:
              'https://images.unsplash.com/photo-1600585153490-76fb20a32601?w=1200',
            order: 3,
          },
        ],
      },
    },
  });

  // ============================================
  // Bookings
  // ============================================
  const now = new Date();

  const booking1 = await prisma.booking.create({
    data: {
      userId: user1.id,
      villaId: villa1.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 1, 10),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 1, 15),
      totalPrice: 450 * 5,
      status: BookingStatus.PAID,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user1.id,
      villaId: villa3.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 2, 5),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 2, 10),
      totalPrice: 650 * 5,
      status: BookingStatus.PENDING,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: user2.id,
      villaId: villa2.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 1, 20),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 1, 25),
      totalPrice: 280 * 5,
      status: BookingStatus.PAID,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      userId: user3.id,
      villaId: villa4.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      totalPrice: 320 * 4,
      status: BookingStatus.PAID,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user4.id,
      villaId: villa5.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 3, 4),
      totalPrice: 195 * 3,
      status: BookingStatus.PENDING,
    },
  });

  // ============================================
  // Payments
  // ============================================
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 2250,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      amount: 1400,
      paymentMethod: PaymentMethod.WALLET,
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking4.id,
      amount: 1280,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.SUCCESS,
    },
  });

  // ============================================
  // Reviews
  // ============================================
  await prisma.review.create({
    data: {
      userId: user1.id,
      villaId: villa1.id,
      rating: 5,
      comment:
        'Absolutely breathtaking! The sunset views from the infinity pool were magical. The butler service was impeccable. We will definitely return.',
    },
  });

  await prisma.review.create({
    data: {
      userId: user2.id,
      villaId: villa2.id,
      rating: 4,
      comment:
        'A serene escape in the heart of Ubud. The garden is lush and the outdoor bathtub was a highlight. Minor issue with WiFi but overall wonderful.',
    },
  });

  await prisma.review.create({
    data: {
      userId: user3.id,
      villaId: villa4.id,
      rating: 5,
      comment:
        'Waking up to Mount Agung views was surreal. The fireplace made evenings cozy. Perfect for a quiet getaway with friends.',
    },
  });

  await prisma.review.create({
    data: {
      userId: user1.id,
      villaId: villa3.id,
      rating: 5,
      comment:
        'Direct beach access is unbeatable. The infinity pool overlooking the ocean is Instagram-worthy. Best villa in Seminyak hands down.',
    },
  });

  await prisma.review.create({
    data: {
      userId: user4.id,
      villaId: villa1.id,
      rating: 4,
      comment:
        'Beautiful property with stunning views. The rooms are spacious and well-maintained. Would recommend for families or groups.',
    },
  });

  // ============================================
  // Deposits
  // ============================================
  await prisma.deposit.create({
    data: {
      userId: user1.id,
      amount: 5000,
      status: TransactionStatus.SUCCESS,
    },
  });

  await prisma.deposit.create({
    data: {
      userId: user2.id,
      amount: 2500,
      status: TransactionStatus.SUCCESS,
    },
  });

  await prisma.deposit.create({
    data: {
      userId: user4.id,
      amount: 1200,
      status: TransactionStatus.SUCCESS,
    },
  });

  // ============================================
  // Withdrawals
  // ============================================
  await prisma.withdrawal.create({
    data: {
      userId: user1.id,
      amount: 500,
      bankAccount: 'Bank Central Asia - 1234567890',
      status: TransactionStatus.PENDING,
    },
  });

  await prisma.withdrawal.create({
    data: {
      userId: user2.id,
      amount: 300,
      bankAccount: 'Mandiri Bank - 0987654321',
      status: TransactionStatus.SUCCESS,
    },
  });

  // ============================================
  // Notifications
  // ============================================
  await prisma.notification.create({
    data: {
      userId: user1.id,
      title: 'Booking Confirmed',
      message:
        'Your booking at Sunset Cliff Villa has been confirmed for next month.',
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user1.id,
      title: 'Payment Received',
      message:
        'Payment of $2,250 for Sunset Cliff Villa has been received successfully.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user2.id,
      title: 'New Review',
      message: 'Your review for Tropical Garden Retreat has been published.',
      isRead: true,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user3.id,
      title: 'Welcome!',
      message:
        'Welcome to Modern Villa! Start exploring our exclusive properties today.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: user4.id,
      title: 'Withdrawal Processed',
      message: 'Your withdrawal request has been processed successfully.',
      isRead: false,
    },
  });

  // ============================================
  // Admin Logs
  // ============================================
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action:
        'Created seed data for 5 users, 6 villas, 5 bookings, 5 reviews, 3 payments, 3 deposits, 2 withdrawals, 5 notifications',
    },
  });

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'Verified database integrity after initial seed',
    },
  });

  // ============================================
  // Languages & Translations
  // ============================================
  const langEn = await prisma.language.create({
    data: {
      code: 'en',
      name: 'English',
      nativeName: 'English',
      flagIcon: '🇺🇸',
      isDefault: true,
      isActive: true,
    },
  });
  const langId = await prisma.language.create({
    data: {
      code: 'id',
      name: 'Indonesian',
      nativeName: 'Bahasa Indonesia',
      flagIcon: '🇮🇩',
      isDefault: false,
      isActive: true,
    },
  });
  const langJp = await prisma.language.create({
    data: {
      code: 'jp',
      name: 'Japanese',
      nativeName: '日本語',
      flagIcon: '🇯🇵',
      isDefault: false,
      isActive: true,
    },
  });

  const translationData: Array<{
    key: string;
    description: string;
    en: string;
    id: string;
    jp: string;
  }> = [
    {
      key: 'navbar.home',
      description: 'Navbar home link',
      en: 'Home',
      id: 'Beranda',
      jp: 'ホーム',
    },
    {
      key: 'navbar.explore',
      description: 'Navbar explore link',
      en: 'Explore',
      id: 'Jelajahi',
      jp: '探索',
    },
    {
      key: 'navbar.login',
      description: 'Navbar login button',
      en: 'Log in',
      id: 'Masuk',
      jp: 'ログイン',
    },
    {
      key: 'navbar.signup',
      description: 'Navbar signup button',
      en: 'Sign up',
      id: 'Daftar',
      jp: '新規登録',
    },
    {
      key: 'navbar.dashboard',
      description: 'Navbar dashboard link',
      en: 'Dashboard',
      id: 'Dasbor',
      jp: 'ダッシュボード',
    },
    {
      key: 'navbar.profile',
      description: 'Navbar profile link',
      en: 'Profile',
      id: 'Profil',
      jp: 'プロフィール',
    },
    {
      key: 'navbar.admin_panel',
      description: 'Navbar admin panel link',
      en: 'Admin Panel',
      id: 'Panel Admin',
      jp: '管理パネル',
    },
    {
      key: 'navbar.logout',
      description: 'Navbar logout button',
      en: 'Log out',
      id: 'Keluar',
      jp: 'ログアウト',
    },
    {
      key: 'homepage.hero.title',
      description: 'Hero section title',
      en: 'Find Your Perfect Villa Getaway',
      id: 'Temukan Villa Impian Anda',
      jp: '理想のヴィラを見つけよう',
    },
    {
      key: 'homepage.hero.subtitle',
      description: 'Hero section subtitle',
      en: 'Discover handpicked luxury villas with verified reviews and seamless booking.',
      id: 'Temukan villa mewah pilihan dengan ulasan terverifikasi dan pemesanan mudah.',
      jp: '厳選された高級ヴィラを、認証済みレビューとシームレスな予約で。',
    },
    {
      key: 'homepage.hero.cta',
      description: 'Hero CTA button',
      en: 'Explore Villas',
      id: 'Jelajahi Villa',
      jp: 'ヴィラを探す',
    },
    {
      key: 'homepage.featured.title',
      description: 'Featured villas heading',
      en: 'Featured Villas',
      id: 'Villa Unggulan',
      jp: '注目のヴィラ',
    },
    {
      key: 'homepage.featured.subtitle',
      description: 'Featured villas subtitle',
      en: 'Handpicked properties for your next vacation',
      id: 'Properti pilihan untuk liburan Anda berikutnya',
      jp: '次のバケーションにぴったりの厳選物件',
    },
    {
      key: 'homepage.features.title',
      description: 'Features section heading',
      en: 'Why Choose Modern Villa',
      id: 'Mengapa Pilih Modern Villa',
      jp: 'Modern Villaを選ぶ理由',
    },
    {
      key: 'homepage.cta.title',
      description: 'CTA section heading',
      en: 'Ready for Your Next Adventure?',
      id: 'Siap untuk Petualangan Berikutnya?',
      jp: '次の冒険の準備はできましたか？',
    },
    {
      key: 'homepage.cta.subtitle',
      description: 'CTA section subtitle',
      en: 'Browse our collection of premium villas and book your dream getaway today.',
      id: 'Jelajahi koleksi villa premium kami dan pesan liburan impian Anda hari ini.',
      jp: 'プレミアムヴィラのコレクションを閲覧して、今日夢の休暇を予約しましょう。',
    },
    {
      key: 'villa.per_night',
      description: 'Price per night label',
      en: '/night',
      id: '/malam',
      jp: '/泊',
    },
    {
      key: 'villa.max_guests',
      description: 'Max guests label',
      en: 'Max {{count}} guests',
      id: 'Maks {{count}} tamu',
      jp: '最大{{count}}名',
    },
    {
      key: 'villa.reviews',
      description: 'Reviews label',
      en: '{{count}} reviews',
      id: '{{count}} ulasan',
      jp: '{{count}}件のレビュー',
    },
    {
      key: 'villa.no_results',
      description: 'No villas found',
      en: 'No villas found',
      id: 'Villa tidak ditemukan',
      jp: 'ヴィラが見つかりません',
    },
    {
      key: 'common.loading',
      description: 'Loading text',
      en: 'Loading...',
      id: 'Memuat...',
      jp: '読み込み中...',
    },
    {
      key: 'common.error',
      description: 'Generic error',
      en: 'Something went wrong',
      id: 'Terjadi kesalahan',
      jp: 'エラーが発生しました',
    },
    {
      key: 'common.save',
      description: 'Save button',
      en: 'Save',
      id: 'Simpan',
      jp: '保存',
    },
    {
      key: 'common.cancel',
      description: 'Cancel button',
      en: 'Cancel',
      id: 'Batal',
      jp: 'キャンセル',
    },
    {
      key: 'common.delete',
      description: 'Delete button',
      en: 'Delete',
      id: 'Hapus',
      jp: '削除',
    },
    {
      key: 'common.search',
      description: 'Search placeholder',
      en: 'Search...',
      id: 'Cari...',
      jp: '検索...',
    },
    {
      key: 'auth.login.title',
      description: 'Login page title',
      en: 'Welcome back',
      id: 'Selamat datang kembali',
      jp: 'おかえりなさい',
    },
    {
      key: 'auth.login.subtitle',
      description: 'Login page subtitle',
      en: 'Log in to your account to continue',
      id: 'Masuk ke akun Anda untuk melanjutkan',
      jp: 'アカウントにログインして続行',
    },
    {
      key: 'auth.login.google',
      description: 'Google login button',
      en: 'Continue with Google',
      id: 'Lanjutkan dengan Google',
      jp: 'Googleで続行',
    },
    {
      key: 'auth.login.email',
      description: 'Email label',
      en: 'Email',
      id: 'Email',
      jp: 'メールアドレス',
    },
    {
      key: 'auth.login.password',
      description: 'Password label',
      en: 'Password',
      id: 'Kata sandi',
      jp: 'パスワード',
    },
    {
      key: 'auth.login.submit',
      description: 'Login submit button',
      en: 'Log in',
      id: 'Masuk',
      jp: 'ログイン',
    },
    {
      key: 'auth.login.no_account',
      description: 'No account text',
      en: "Don't have an account?",
      id: 'Belum punya akun?',
      jp: 'アカウントをお持ちでないですか？',
    },
    {
      key: 'auth.register.title',
      description: 'Register page title',
      en: 'Create an account',
      id: 'Buat akun',
      jp: 'アカウント作成',
    },
    {
      key: 'auth.register.subtitle',
      description: 'Register page subtitle',
      en: 'Sign up to start booking premium villas',
      id: 'Daftar untuk mulai memesan villa premium',
      jp: 'プレミアムヴィラの予約を始めましょう',
    },
    {
      key: 'auth.register.fullname',
      description: 'Full name label',
      en: 'Full Name',
      id: 'Nama Lengkap',
      jp: '氏名',
    },
    {
      key: 'auth.register.submit',
      description: 'Register submit button',
      en: 'Create account',
      id: 'Buat akun',
      jp: 'アカウント作成',
    },
    {
      key: 'auth.register.has_account',
      description: 'Has account text',
      en: 'Already have an account?',
      id: 'Sudah punya akun?',
      jp: 'すでにアカウントをお持ちですか？',
    },
    {
      key: 'auth.register.password_hint',
      description: 'Password hint',
      en: 'Must contain at least one letter and one number',
      id: 'Harus mengandung minimal satu huruf dan satu angka',
      jp: '少なくとも1つの文字と1つの数字を含む必要があります',
    },
    {
      key: 'dashboard.overview',
      description: 'Dashboard overview heading',
      en: 'Overview',
      id: 'Ringkasan',
      jp: '概要',
    },
    {
      key: 'dashboard.bookings',
      description: 'Dashboard bookings heading',
      en: 'Bookings',
      id: 'Pemesanan',
      jp: '予約',
    },
    {
      key: 'dashboard.wallet',
      description: 'Dashboard wallet heading',
      en: 'Wallet',
      id: 'Dompet',
      jp: 'ウォレット',
    },
    {
      key: 'dashboard.wallet.balance',
      description: 'Wallet balance label',
      en: 'Current Balance',
      id: 'Saldo Saat Ini',
      jp: '現在の残高',
    },
    {
      key: 'footer.copyright',
      description: 'Footer copyright',
      en: '© {{year}} Modern Villa. All rights reserved.',
      id: '© {{year}} Modern Villa. Hak cipta dilindungi.',
      jp: '© {{year}} Modern Villa. 全著作権所有。',
    },
    {
      key: 'footer.description',
      description: 'Footer description',
      en: 'Discover and book premium villas for your perfect getaway. Handpicked properties with verified reviews.',
      id: 'Temukan dan pesan villa premium untuk liburan sempurna Anda. Properti pilihan dengan ulasan terverifikasi.',
      jp: '完璧な休暇のためにプレミアムヴィラを見つけて予約。厳選された物件と認証済みレビュー。',
    },
    {
      key: 'footer.explore',
      description: 'Footer explore heading',
      en: 'Explore',
      id: 'Jelajahi',
      jp: '探索',
    },
    {
      key: 'footer.company',
      description: 'Footer company heading',
      en: 'Company',
      id: 'Perusahaan',
      jp: '会社情報',
    },
    {
      key: 'footer.contact',
      description: 'Footer contact heading',
      en: 'Contact',
      id: 'Kontak',
      jp: 'お問い合わせ',
    },
    {
      key: 'footer.explore.all_villas',
      description: 'Footer all villas link',
      en: 'All Villas',
      id: 'Semua Villa',
      jp: '全てのヴィラ',
    },
    {
      key: 'footer.explore.bali_villas',
      description: 'Footer bali link',
      en: 'Bali Villas',
      id: 'Villa Bali',
      jp: 'バリのヴィラ',
    },
    {
      key: 'footer.explore.ubud_retreats',
      description: 'Footer ubud link',
      en: 'Ubud Retreats',
      id: 'Retret Ubud',
      jp: 'ウブドのリトリート',
    },
    {
      key: 'footer.explore.seminyak_stays',
      description: 'Footer seminyak link',
      en: 'Seminyak Stays',
      id: 'Penginapan Seminyak',
      jp: 'スミニャクの滞在',
    },
    {
      key: 'footer.company.about',
      description: 'Footer about link',
      en: 'About Us',
      id: 'Tentang Kami',
      jp: '私たちについて',
    },
    {
      key: 'footer.company.careers',
      description: 'Footer careers link',
      en: 'Careers',
      id: 'Karir',
      jp: '採用情報',
    },
    {
      key: 'footer.company.privacy',
      description: 'Footer privacy link',
      en: 'Privacy Policy',
      id: 'Kebijakan Privasi',
      jp: 'プライバシーポリシー',
    },
    {
      key: 'footer.company.terms',
      description: 'Footer terms link',
      en: 'Terms of Service',
      id: 'Syarat Layanan',
      jp: '利用規約',
    },
    {
      key: 'homepage.hero.badge',
      description: 'Hero badge text',
      en: 'Premium Villas, Unforgettable Stays',
      id: 'Villa Premium, Pengalaman Tak Terlupakan',
      jp: 'プレミアムヴィラ、忘れられない滞在',
    },
    {
      key: 'homepage.hero.learn_more',
      description: 'Hero learn more button',
      en: 'Learn More',
      id: 'Pelajari Lebih Lanjut',
      jp: '詳しく見る',
    },
    {
      key: 'homepage.featured.view_all',
      description: 'View all link',
      en: 'View all',
      id: 'Lihat semua',
      jp: 'すべて見る',
    },
    {
      key: 'homepage.featured.view_all_villas',
      description: 'View all villas mobile',
      en: 'View all villas',
      id: 'Lihat semua villa',
      jp: 'すべてのヴィラを見る',
    },
    {
      key: 'homepage.featured.no_villas',
      description: 'No featured villas',
      en: 'No featured villas yet. Check back soon!',
      id: 'Belum ada villa unggulan. Cek kembali nanti!',
      jp: '注目のヴィラはまだありません。後でまたチェックしてください！',
    },
    {
      key: 'homepage.features.subtitle',
      description: 'Features subtitle',
      en: 'We make finding and booking your dream villa effortless',
      id: 'Kami membuat pencarian dan pemesanan villa impian Anda menjadi mudah',
      jp: '夢のヴィラの検索と予約を簡単に',
    },
    {
      key: 'homepage.features.verified.title',
      description: 'Verified feature title',
      en: 'Verified Properties',
      id: 'Properti Terverifikasi',
      jp: '認証済み物件',
    },
    {
      key: 'homepage.features.verified.description',
      description: 'Verified feature desc',
      en: 'Every villa is personally inspected and verified for quality and safety.',
      id: 'Setiap villa diperiksa dan diverifikasi secara personal untuk kualitas dan keamanan.',
      jp: 'すべてのヴィラは品質と安全性のために個別に検査・認証されています。',
    },
    {
      key: 'homepage.features.reviews.title',
      description: 'Reviews feature title',
      en: 'Trusted Reviews',
      id: 'Ulasan Terpercaya',
      jp: '信頼できるレビュー',
    },
    {
      key: 'homepage.features.reviews.description',
      description: 'Reviews feature desc',
      en: 'Real reviews from real guests help you choose the perfect stay.',
      id: 'Ulasan nyata dari tamu nyata membantu Anda memilih penginapan yang sempurna.',
      jp: '実際のゲストからの本物のレビューで、最適な滞在先を選べます。',
    },
    {
      key: 'homepage.features.locations.title',
      description: 'Locations feature title',
      en: 'Prime Locations',
      id: 'Lokasi Utama',
      jp: '一等地',
    },
    {
      key: 'homepage.features.locations.description',
      description: 'Locations feature desc',
      en: 'Handpicked villas in the most beautiful and sought-after destinations.',
      id: 'Villa pilihan di destinasi paling indah dan dicari.',
      jp: '最も美しく人気のある目的地の厳選ヴィラ。',
    },
    {
      key: 'homepage.cta.button',
      description: 'CTA button text',
      en: 'Start Exploring',
      id: 'Mulai Menjelajahi',
      jp: '探索を始める',
    },
    {
      key: 'villa.up_to',
      description: 'Up to guests label',
      en: 'Up to {{count}}',
      id: 'Hingga {{count}}',
      jp: '最大{{count}}名',
    },
    {
      key: 'villa.no_image',
      description: 'No image placeholder',
      en: 'No image',
      id: 'Tidak ada gambar',
      jp: '画像なし',
    },
    {
      key: 'auth.or',
      description: 'Or separator',
      en: 'or',
      id: 'atau',
      jp: 'または',
    },
    {
      key: 'dashboard.profile',
      description: 'Dashboard profile link',
      en: 'Profile',
      id: 'Profil',
      jp: 'プロフィール',
    },
    {
      key: 'admin.analytics',
      description: 'Admin analytics link',
      en: 'Analytics',
      id: 'Analitik',
      jp: 'アナリティクス',
    },
    {
      key: 'admin.villas',
      description: 'Admin villas link',
      en: 'Villas',
      id: 'Villa',
      jp: 'ヴィラ',
    },
    {
      key: 'admin.bookings',
      description: 'Admin bookings link',
      en: 'Bookings',
      id: 'Pemesanan',
      jp: '予約',
    },
    {
      key: 'admin.users',
      description: 'Admin users link',
      en: 'Users',
      id: 'Pengguna',
      jp: 'ユーザー',
    },
    {
      key: 'admin.reviews',
      description: 'Admin reviews link',
      en: 'Reviews',
      id: 'Ulasan',
      jp: 'レビュー',
    },
    {
      key: 'admin.transactions',
      description: 'Admin transactions link',
      en: 'Transactions',
      id: 'Transaksi',
      jp: '取引',
    },
  ];

  for (const t of translationData) {
    const tk = await prisma.translationKey.create({
      data: { key: t.key, description: t.description },
    });
    await prisma.translationValue.createMany({
      data: [
        { languageId: langEn.id, translationKeyId: tk.id, value: t.en },
        { languageId: langId.id, translationKeyId: tk.id, value: t.id },
        { languageId: langJp.id, translationKeyId: tk.id, value: t.jp },
      ],
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('👤 Users created:', 5);
  console.log('   - admin@modernvilla.com (password: admin123)');
  console.log('   - sarah.jones@email.com (password: password123)');
  console.log('   - michael.chen@email.com (password: password123)');
  console.log('   - emma.wilson@email.com (password: password123)');
  console.log('   - david.park@email.com (password: password123)');
  console.log('');
  console.log('🏡 Villas created:', 6);
  console.log('📅 Bookings created:', 5);
  console.log('⭐ Reviews created:', 5);
  console.log('💳 Payments created:', 3);
  console.log('💰 Deposits created:', 3);
  console.log('🏧 Withdrawals created:', 2);
  console.log('🔔 Notifications created:', 5);
  console.log('📋 Admin logs created:', 2);
  console.log('🌐 Languages created:', 3);
  console.log('🔤 Translation keys created:', translationData.length);
  console.log('📝 Translation values created:', translationData.length * 3);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
