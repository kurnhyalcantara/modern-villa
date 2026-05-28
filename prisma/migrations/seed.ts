import { PrismaPg } from '@prisma/adapter-pg';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import {
  PrismaClient,
  BookingStatus,
  DepositStatus,
  PaymentStatus,
  PaymentMethod,
  PaymentType,
  UserRole,
  WithdrawStatus,
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
  await prisma.featureFlag.deleteMany();
  await prisma.paymentReceiverAccount.deleteMany();
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
      balance: 5_000_000,
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
      balance: 2_500_000,
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
      balance: 1_200_000,
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
      pricePerNight: 6_500_000,
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
      pricePerNight: 4_200_000,
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
      pricePerNight: 9_800_000,
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
      pricePerNight: 4_800_000,
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
      pricePerNight: 2_900_000,
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
      pricePerNight: 13_500_000,
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
      totalPrice: 6_500_000 * 5,
      status: BookingStatus.PAID,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user1.id,
      villaId: villa3.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 2, 5),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 2, 10),
      totalPrice: 9_800_000 * 5,
      status: BookingStatus.PENDING,
    },
  });

  const booking3 = await prisma.booking.create({
    data: {
      userId: user2.id,
      villaId: villa2.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 1, 20),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 1, 25),
      totalPrice: 4_200_000 * 5,
      status: BookingStatus.PAID,
    },
  });

  const booking4 = await prisma.booking.create({
    data: {
      userId: user3.id,
      villaId: villa4.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      checkOut: new Date(now.getFullYear(), now.getMonth() - 1, 5),
      totalPrice: 4_800_000 * 4,
      status: BookingStatus.PAID,
    },
  });

  await prisma.booking.create({
    data: {
      userId: user4.id,
      villaId: villa5.id,
      checkIn: new Date(now.getFullYear(), now.getMonth() + 3, 1),
      checkOut: new Date(now.getFullYear(), now.getMonth() + 3, 4),
      totalPrice: 2_900_000 * 3,
      status: BookingStatus.PENDING,
    },
  });

  // ============================================
  // Payments
  // ============================================
  await prisma.payment.create({
    data: {
      bookingId: booking1.id,
      amount: 32_500_000,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking3.id,
      amount: 21_000_000,
      paymentMethod: PaymentMethod.WALLET,
      status: PaymentStatus.SUCCESS,
    },
  });

  await prisma.payment.create({
    data: {
      bookingId: booking4.id,
      amount: 19_200_000,
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
      amount: 5_000_000,
      status: DepositStatus.APPROVED,
    },
  });

  await prisma.deposit.create({
    data: {
      userId: user2.id,
      amount: 2_500_000,
      status: DepositStatus.APPROVED,
    },
  });

  await prisma.deposit.create({
    data: {
      userId: user4.id,
      amount: 1_200_000,
      status: DepositStatus.APPROVED,
    },
  });

  // ============================================
  // Withdrawals
  // ============================================
  await prisma.withdrawal.create({
    data: {
      userId: user1.id,
      amount: 500_000,
      bankAccount: '1234567890',
      bankName: 'Bank Central Asia',
      status: WithdrawStatus.PENDING,
    },
  });

  await prisma.withdrawal.create({
    data: {
      userId: user2.id,
      amount: 300_000,
      bankAccount: '0987654321',
      bankName: 'Bank Mandiri',
      status: WithdrawStatus.COMPLETED,
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
        'Payment of Rp32.500.000 for Sunset Cliff Villa has been received successfully.',
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
  // Feature Flags
  // ============================================
  await prisma.featureFlag.createMany({
    data: [
      {
        key: 'deposit.manual_verification',
        description: 'Enable manual bank transfer deposit with evidence upload',
        value: 'true',
        type: 'BOOLEAN',
        isActive: true,
      },
      {
        key: 'deposit.gateway_enabled',
        description: 'Enable payment gateway for deposits',
        value: 'false',
        type: 'BOOLEAN',
        isActive: true,
      },
      {
        key: 'withdraw.manual_review',
        description: 'Enable manual admin-reviewed withdrawals',
        value: 'true',
        type: 'BOOLEAN',
        isActive: true,
      },
      {
        key: 'withdraw.gateway_enabled',
        description: 'Enable payment gateway for withdrawals',
        value: 'false',
        type: 'BOOLEAN',
        isActive: true,
      },
      {
        key: 'maintenance_mode',
        description: 'Put the application in maintenance mode',
        value: 'false',
        type: 'BOOLEAN',
        isActive: true,
      },
    ],
  });

  // ============================================
  // Payment Receiver Accounts
  // ============================================
  await prisma.paymentReceiverAccount.createMany({
    data: [
      {
        bankName: 'Bank Central Asia (BCA)',
        accountName: 'Modern Villa Indonesia',
        accountNumber: '1234567890',
        paymentType: PaymentType.BANK_TRANSFER,
        instructions: 'Transfer exact amount. Include your deposit ID in the description.',
        isActive: true,
        isDefault: true,
        displayOrder: 0,
      },
      {
        bankName: 'Bank Mandiri',
        accountName: 'Modern Villa Indonesia',
        accountNumber: '0987654321',
        paymentType: PaymentType.BANK_TRANSFER,
        instructions: 'Transfer exact amount. Include your deposit ID in the description.',
        isActive: true,
        isDefault: false,
        displayOrder: 1,
      },
      {
        bankName: 'GoPay',
        accountName: 'Modern Villa',
        accountNumber: '081234567890',
        paymentType: PaymentType.E_WALLET,
        instructions: 'Send to this GoPay number. Include your deposit ID in the note.',
        isActive: true,
        isDefault: false,
        displayOrder: 2,
      },
    ],
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
    {
      key: 'admin.receiverAccounts',
      description: 'Admin receiver accounts link',
      en: 'Receiver Accounts',
      id: 'Akun Penerima',
      jp: '受取口座',
    },
    {
      key: 'admin.featureFlags',
      description: 'Admin feature flags link',
      en: 'Feature Flags',
      id: 'Pengaturan Fitur',
      jp: '機能フラグ',
    },
    // ── Toast / Common messages ─────────────────────────────
    {
      key: 'toast.auth_failed',
      description: 'Authentication failed toast',
      en: 'Authentication failed. Please try again.',
      id: 'Autentikasi gagal. Silakan coba lagi.',
      jp: '認証に失敗しました。もう一度お試しください。',
    },
    {
      key: 'toast.invalid_oauth',
      description: 'Invalid OAuth callback toast',
      en: 'Invalid OAuth callback. Please try again.',
      id: 'Callback OAuth tidak valid. Silakan coba lagi.',
      jp: '無効なOAuthコールバックです。もう一度お試しください。',
    },
    {
      key: 'toast.login_failed',
      description: 'Login failed toast',
      en: 'Login failed',
      id: 'Login gagal',
      jp: 'ログインに失敗しました',
    },
    {
      key: 'toast.welcome_back',
      description: 'Welcome back toast',
      en: 'Welcome back!',
      id: 'Selamat datang kembali!',
      jp: 'おかえりなさい！',
    },
    {
      key: 'toast.something_wrong',
      description: 'Generic error toast',
      en: 'Something went wrong',
      id: 'Terjadi kesalahan',
      jp: 'エラーが発生しました',
    },
    {
      key: 'toast.google_login_failed',
      description: 'Google login failed toast',
      en: 'Failed to start Google login',
      id: 'Gagal memulai login Google',
      jp: 'Googleログインの開始に失敗しました',
    },
    {
      key: 'toast.logged_out',
      description: 'Logged out toast',
      en: 'Logged out',
      id: 'Berhasil keluar',
      jp: 'ログアウトしました',
    },
    {
      key: 'toast.logout_failed',
      description: 'Logout failed toast',
      en: 'Logout failed',
      id: 'Gagal keluar',
      jp: 'ログアウトに失敗しました',
    },
    {
      key: 'toast.name_min',
      description: 'Name minimum chars toast',
      en: 'Name must be at least 2 characters',
      id: 'Nama harus minimal 2 karakter',
      jp: '名前は2文字以上必要です',
    },
    {
      key: 'toast.password_min',
      description: 'Password minimum chars toast',
      en: 'Password must be at least 8 characters',
      id: 'Kata sandi harus minimal 8 karakter',
      jp: 'パスワードは8文字以上必要です',
    },
    {
      key: 'toast.password_requirements',
      description: 'Password requirements toast',
      en: 'Password must contain at least one letter and one number',
      id: 'Kata sandi harus mengandung minimal satu huruf dan satu angka',
      jp: 'パスワードには少なくとも1つの文字と1つの数字が必要です',
    },
    {
      key: 'toast.registration_failed',
      description: 'Registration failed toast',
      en: 'Registration failed',
      id: 'Pendaftaran gagal',
      jp: '登録に失敗しました',
    },
    {
      key: 'toast.account_created',
      description: 'Account created toast',
      en: 'Account created! Logging you in…',
      id: 'Akun dibuat! Sedang masuk…',
      jp: 'アカウントが作成されました！ログイン中…',
    },
    {
      key: 'toast.google_signup_failed',
      description: 'Google signup failed toast',
      en: 'Failed to start Google sign-up',
      id: 'Gagal memulai pendaftaran Google',
      jp: 'Google登録の開始に失敗しました',
    },
    {
      key: 'toast.payment_success',
      description: 'Payment success toast',
      en: 'Payment successful! Booking confirmed.',
      id: 'Pembayaran berhasil! Pemesanan dikonfirmasi.',
      jp: '支払い成功！予約が確定しました。',
    },
    {
      key: 'toast.payment_failed',
      description: 'Payment failed toast',
      en: 'Payment failed',
      id: 'Pembayaran gagal',
      jp: '支払いに失敗しました',
    },
    {
      key: 'toast.cancel_failed',
      description: 'Cancel failed toast',
      en: 'Cancellation failed',
      id: 'Pembatalan gagal',
      jp: 'キャンセルに失敗しました',
    },
    {
      key: 'toast.booking_cancelled',
      description: 'Booking cancelled toast',
      en: 'Booking cancelled successfully.',
      id: 'Pemesanan berhasil dibatalkan.',
      jp: '予約がキャンセルされました。',
    },
    {
      key: 'toast.profile_updated',
      description: 'Profile updated toast',
      en: 'Profile updated',
      id: 'Profil diperbarui',
      jp: 'プロフィールが更新されました',
    },
    {
      key: 'toast.update_failed',
      description: 'Update failed toast',
      en: 'Update failed',
      id: 'Pembaruan gagal',
      jp: '更新に失敗しました',
    },
    {
      key: 'toast.enter_valid_amount',
      description: 'Enter valid amount toast',
      en: 'Enter a valid amount',
      id: 'Masukkan jumlah yang valid',
      jp: '有効な金額を入力してください',
    },
    {
      key: 'toast.deposit_failed',
      description: 'Deposit failed toast',
      en: 'Deposit failed',
      id: 'Deposit gagal',
      jp: '入金に失敗しました',
    },
    {
      key: 'toast.deposit_created',
      description: 'Deposit created toast',
      en: 'Deposit created. Please complete the transfer.',
      id: 'Deposit dibuat. Silakan selesaikan transfer.',
      jp: '入金が作成されました。送金を完了してください。',
    },
    {
      key: 'toast.gateway_coming',
      description: 'Gateway coming soon toast',
      en: 'Payment gateway integration coming soon.',
      id: 'Integrasi gateway pembayaran segera hadir.',
      jp: '決済ゲートウェイの統合は近日公開予定です。',
    },
    {
      key: 'toast.insufficient_balance',
      description: 'Insufficient balance toast',
      en: 'Insufficient balance',
      id: 'Saldo tidak mencukupi',
      jp: '残高不足です',
    },
    {
      key: 'toast.invalid_bank_account',
      description: 'Invalid bank account toast',
      en: 'Enter a valid bank account',
      id: 'Masukkan rekening bank yang valid',
      jp: '有効な銀行口座を入力してください',
    },
    {
      key: 'toast.withdrawal_failed',
      description: 'Withdrawal failed toast',
      en: 'Withdrawal failed',
      id: 'Penarikan gagal',
      jp: '出金に失敗しました',
    },
    {
      key: 'toast.withdrawal_submitted',
      description: 'Withdrawal submitted toast',
      en: 'Withdrawal of {{amount}} submitted. Pending admin review.',
      id: 'Penarikan sebesar {{amount}} diajukan. Menunggu review admin.',
      jp: '{{amount}}の出金が送信されました。管理者の審査待ちです。',
    },
    {
      key: 'toast.gateway_withdraw_coming',
      description: 'Gateway withdraw coming toast',
      en: 'Gateway withdraw integration coming soon.',
      id: 'Integrasi penarikan gateway segera hadir.',
      jp: 'ゲートウェイ出金の統合は近日公開予定です。',
    },
    {
      key: 'toast.copied',
      description: 'Copied to clipboard toast',
      en: 'Copied to clipboard',
      id: 'Disalin ke clipboard',
      jp: 'クリップボードにコピーしました',
    },
    {
      key: 'toast.invalid_file',
      description: 'Invalid file type toast',
      en: 'Invalid file type. Use jpg, jpeg, png, or webp.',
      id: 'Jenis file tidak valid. Gunakan jpg, jpeg, png, atau webp.',
      jp: '無効なファイル形式です。jpg、jpeg、png、webpを使用してください。',
    },
    {
      key: 'toast.file_too_large',
      description: 'File too large toast',
      en: 'File size must be under 5MB.',
      id: 'Ukuran file harus di bawah 5MB.',
      jp: 'ファイルサイズは5MB以下にしてください。',
    },
    {
      key: 'toast.upload_failed',
      description: 'Upload failed toast',
      en: 'Upload failed',
      id: 'Upload gagal',
      jp: 'アップロードに失敗しました',
    },
    {
      key: 'toast.evidence_failed',
      description: 'Evidence submission failed toast',
      en: 'Failed to submit evidence',
      id: 'Gagal mengirim bukti',
      jp: '証拠の送信に失敗しました',
    },
    {
      key: 'toast.evidence_submitted',
      description: 'Evidence submitted toast',
      en: 'Evidence submitted! Your deposit is now pending verification.',
      id: 'Bukti dikirim! Deposit Anda sedang menunggu verifikasi.',
      jp: '証拠が送信されました！入金は現在確認待ちです。',
    },
    {
      key: 'toast.status_updated',
      description: 'Status updated toast',
      en: 'Status updated',
      id: 'Status diperbarui',
      jp: 'ステータスが更新されました',
    },
    {
      key: 'toast.role_updated',
      description: 'Role updated toast',
      en: 'Role updated',
      id: 'Role diperbarui',
      jp: 'ロールが更新されました',
    },
    {
      key: 'toast.villa_created',
      description: 'Villa created toast',
      en: 'Villa created',
      id: 'Villa dibuat',
      jp: 'ヴィラが作成されました',
    },
    {
      key: 'toast.villa_updated',
      description: 'Villa updated toast',
      en: 'Villa updated',
      id: 'Villa diperbarui',
      jp: 'ヴィラが更新されました',
    },
    {
      key: 'toast.operation_failed',
      description: 'Operation failed toast',
      en: 'Operation failed',
      id: 'Operasi gagal',
      jp: '操作に失敗しました',
    },
    {
      key: 'toast.villa_deleted',
      description: 'Villa deleted toast',
      en: 'Villa deleted',
      id: 'Villa dihapus',
      jp: 'ヴィラが削除されました',
    },
    {
      key: 'toast.delete_failed',
      description: 'Delete failed toast',
      en: 'Delete failed',
      id: 'Penghapusan gagal',
      jp: '削除に失敗しました',
    },
    {
      key: 'toast.review_deleted',
      description: 'Review deleted toast',
      en: 'Review deleted',
      id: 'Ulasan dihapus',
      jp: 'レビューが削除されました',
    },
    {
      key: 'toast.booking_created',
      description: 'Booking created toast',
      en: 'Booking created! Proceed to payment.',
      id: 'Pemesanan dibuat! Lanjutkan ke pembayaran.',
      jp: '予約が作成されました！お支払いに進んでください。',
    },
    {
      key: 'toast.booking_failed',
      description: 'Booking failed toast',
      en: 'Booking failed',
      id: 'Pemesanan gagal',
      jp: '予約に失敗しました',
    },
    {
      key: 'toast.select_dates',
      description: 'Select dates toast',
      en: 'Please select check-in and check-out dates',
      id: 'Silakan pilih tanggal check-in dan check-out',
      jp: 'チェックインとチェックアウトの日付を選択してください',
    },
    {
      key: 'toast.checkout_after_checkin',
      description: 'Checkout after checkin toast',
      en: 'Check-out must be after check-in',
      id: 'Check-out harus setelah check-in',
      jp: 'チェックアウトはチェックイン後でなければなりません',
    },
    {
      key: 'toast.guests_range',
      description: 'Guests range toast',
      en: 'Guests must be between 1 and {{max}}',
      id: 'Tamu harus antara 1 dan {{max}}',
      jp: 'ゲスト数は1から{{max}}の間でなければなりません',
    },
    {
      key: 'toast.account_updated',
      description: 'Account updated toast',
      en: 'Account updated',
      id: 'Akun diperbarui',
      jp: 'アカウントが更新されました',
    },
    {
      key: 'toast.account_created_admin',
      description: 'Account created (admin) toast',
      en: 'Account created',
      id: 'Akun dibuat',
      jp: 'アカウントが作成されました',
    },
    {
      key: 'toast.account_deleted',
      description: 'Account deleted toast',
      en: 'Account deleted',
      id: 'Akun dihapus',
      jp: 'アカウントが削除されました',
    },
    {
      key: 'toast.default_account_set',
      description: 'Default account set toast',
      en: 'Default account set',
      id: 'Akun default ditetapkan',
      jp: 'デフォルトアカウントが設定されました',
    },
    {
      key: 'toast.account_activated',
      description: 'Account activated toast',
      en: 'Account activated',
      id: 'Akun diaktifkan',
      jp: 'アカウントが有効化されました',
    },
    {
      key: 'toast.account_deactivated',
      description: 'Account deactivated toast',
      en: 'Account deactivated',
      id: 'Akun dinonaktifkan',
      jp: 'アカウントが無効化されました',
    },
    {
      key: 'toast.required_fields',
      description: 'Required fields toast',
      en: 'Bank name, account name and account number are required',
      id: 'Nama bank, nama akun, dan nomor akun wajib diisi',
      jp: '銀行名、口座名、口座番号は必須です',
    },
    {
      key: 'toast.qr_uploaded',
      description: 'QR uploaded toast',
      en: 'QR image uploaded',
      id: 'Gambar QR diunggah',
      jp: 'QR画像がアップロードされました',
    },
    {
      key: 'toast.invalid_file_type',
      description: 'Invalid file type (qr) toast',
      en: 'Invalid file type',
      id: 'Jenis file tidak valid',
      jp: '無効なファイル形式',
    },
    {
      key: 'toast.file_too_large_2mb',
      description: 'File too large 2MB toast',
      en: 'File too large (max 2MB)',
      id: 'File terlalu besar (maks 2MB)',
      jp: 'ファイルが大きすぎます（最大2MB）',
    },
    {
      key: 'toast.create_failed',
      description: 'Create failed toast',
      en: 'Create failed',
      id: 'Gagal membuat',
      jp: '作成に失敗しました',
    },
    {
      key: 'toast.flag_value_updated',
      description: 'Flag value updated toast',
      en: 'Flag value updated',
      id: 'Nilai flag diperbarui',
      jp: 'フラグ値が更新されました',
    },
    {
      key: 'toast.action_failed',
      description: 'Action failed toast',
      en: 'Action failed',
      id: 'Tindakan gagal',
      jp: 'アクションに失敗しました',
    },
    {
      key: 'toast.key_required',
      description: 'Key required toast',
      en: 'Key is required',
      id: 'Key wajib diisi',
      jp: 'キーは必須です',
    },
    // ── Villas page ─────────────────────────────────────────
    {
      key: 'villas.page.title',
      description: 'Villas page title',
      en: 'Explore Villas',
      id: 'Jelajahi Villa',
      jp: 'ヴィラを探す',
    },
    {
      key: 'villas.page.subtitle',
      description: 'Villas page subtitle',
      en: 'Find your perfect villa from our curated collection',
      id: 'Temukan villa sempurna dari koleksi pilihan kami',
      jp: '厳選コレクションから理想のヴィラを見つけましょう',
    },
    {
      key: 'villas.no_villas_found',
      description: 'No villas found (with filters)',
      en: 'No villas found',
      id: 'Villa tidak ditemukan',
      jp: 'ヴィラが見つかりません',
    },
    {
      key: 'villas.no_villas_available',
      description: 'No villas available',
      en: 'No villas available',
      id: 'Tidak ada villa tersedia',
      jp: '利用可能なヴィラはありません',
    },
    {
      key: 'villas.filter_hint',
      description: 'Filter hint text',
      en: 'Try adjusting your filters or search terms.',
      id: 'Coba sesuaikan filter atau kata pencarian Anda.',
      jp: 'フィルターまたは検索条件を調整してみてください。',
    },
    {
      key: 'villas.check_back',
      description: 'Check back text',
      en: 'Check back soon for new listings.',
      id: 'Cek kembali nanti untuk listing baru.',
      jp: '新しいリスティングをお待ちください。',
    },
    {
      key: 'villas.search_placeholder',
      description: 'Villas search placeholder',
      en: 'Search villas by name, location...',
      id: 'Cari villa berdasarkan nama, lokasi...',
      jp: '名前、場所でヴィラを検索...',
    },
    {
      key: 'villas.search',
      description: 'Search button',
      en: 'Search',
      id: 'Cari',
      jp: '検索',
    },
    {
      key: 'villas.filters',
      description: 'Filters button',
      en: 'Filters',
      id: 'Filter',
      jp: 'フィルター',
    },
    {
      key: 'villas.reset',
      description: 'Reset button',
      en: 'Reset',
      id: 'Reset',
      jp: 'リセット',
    },
    {
      key: 'villas.location',
      description: 'Location filter label',
      en: 'Location',
      id: 'Lokasi',
      jp: '場所',
    },
    {
      key: 'villas.all_locations',
      description: 'All locations option',
      en: 'All locations',
      id: 'Semua lokasi',
      jp: 'すべての場所',
    },
    {
      key: 'villas.guests',
      description: 'Guests filter label',
      en: 'Guests',
      id: 'Tamu',
      jp: 'ゲスト',
    },
    {
      key: 'villas.any',
      description: 'Any option',
      en: 'Any',
      id: 'Semua',
      jp: 'すべて',
    },
    {
      key: 'villas.guests_plus',
      description: 'Guests plus option',
      en: '{{count}}+ guests',
      id: '{{count}}+ tamu',
      jp: '{{count}}名以上',
    },
    {
      key: 'villas.sort_by',
      description: 'Sort by label',
      en: 'Sort By',
      id: 'Urutkan',
      jp: '並べ替え',
    },
    {
      key: 'villas.results_count',
      description: 'Results count (plural)',
      en: '{{count}} villas found',
      id: '{{count}} villa ditemukan',
      jp: '{{count}}件のヴィラが見つかりました',
    },
    {
      key: 'villas.result_count',
      description: 'Result count (singular)',
      en: '{{count}} villa found',
      id: '{{count}} villa ditemukan',
      jp: '{{count}}件のヴィラが見つかりました',
    },
    // ── Villa detail ────────────────────────────────────────
    {
      key: 'villa.breadcrumb.home',
      description: 'Breadcrumb home',
      en: 'Home',
      id: 'Beranda',
      jp: 'ホーム',
    },
    {
      key: 'villa.breadcrumb.villas',
      description: 'Breadcrumb villas',
      en: 'Villas',
      id: 'Villa',
      jp: 'ヴィラ',
    },
    {
      key: 'villa.review_singular',
      description: 'Review singular',
      en: 'review',
      id: 'ulasan',
      jp: 'レビュー',
    },
    {
      key: 'villa.reviews_plural',
      description: 'Reviews plural',
      en: 'reviews',
      id: 'ulasan',
      jp: 'レビュー',
    },
    {
      key: 'villa.up_to_guests',
      description: 'Up to X guests label',
      en: 'Up to {{count}} guests',
      id: 'Hingga {{count}} tamu',
      jp: '最大{{count}}名',
    },
    {
      key: 'villa.about',
      description: 'About this villa heading',
      en: 'About this villa',
      id: 'Tentang villa ini',
      jp: 'このヴィラについて',
    },
    {
      key: 'villa.availability',
      description: 'Availability heading',
      en: 'Availability',
      id: 'Ketersediaan',
      jp: '空室状況',
    },
    {
      key: 'villa.night_label',
      description: 'Per night label',
      en: '/ night',
      id: '/ malam',
      jp: '/ 泊',
    },
    {
      key: 'villa.location_label',
      description: 'Location label',
      en: 'Location',
      id: 'Lokasi',
      jp: '場所',
    },
    {
      key: 'villa.max_guests_label',
      description: 'Max guests sidebar label',
      en: 'Max Guests',
      id: 'Maks Tamu',
      jp: '最大ゲスト数',
    },
    {
      key: 'villa.rating_label',
      description: 'Rating label',
      en: 'Rating',
      id: 'Penilaian',
      jp: '評価',
    },
    {
      key: 'villa.not_found',
      description: 'Villa not found title',
      en: 'Villa not found',
      id: 'Villa tidak ditemukan',
      jp: 'ヴィラが見つかりません',
    },
    {
      key: 'villa.not_found_description',
      description: 'Villa not found description',
      en: "The villa you're looking for doesn't exist or has been removed.",
      id: 'Villa yang Anda cari tidak ada atau telah dihapus.',
      jp: 'お探しのヴィラは存在しないか、削除されました。',
    },
    {
      key: 'villa.browse_all',
      description: 'Browse all villas link',
      en: 'Browse all villas',
      id: 'Lihat semua villa',
      jp: 'すべてのヴィラを見る',
    },
    {
      key: 'villa.no_images',
      description: 'No images available',
      en: 'No images available',
      id: 'Tidak ada gambar tersedia',
      jp: '画像はありません',
    },
    {
      key: 'villa.more_images',
      description: 'More images overlay',
      en: '+{{count}} more',
      id: '+{{count}} lagi',
      jp: '+{{count}}枚',
    },
    // ── Booking form ────────────────────────────────────────
    {
      key: 'booking.checkin',
      description: 'Check-in label',
      en: 'Check-in',
      id: 'Check-in',
      jp: 'チェックイン',
    },
    {
      key: 'booking.checkout',
      description: 'Check-out label',
      en: 'Check-out',
      id: 'Check-out',
      jp: 'チェックアウト',
    },
    {
      key: 'booking.guests',
      description: 'Guests label',
      en: 'Guests',
      id: 'Tamu',
      jp: 'ゲスト',
    },
    {
      key: 'booking.max_guests',
      description: 'Maximum guests hint',
      en: 'Maximum {{count}} guests',
      id: 'Maksimal {{count}} tamu',
      jp: '最大{{count}}名',
    },
    {
      key: 'booking.night',
      description: 'Night singular',
      en: 'night',
      id: 'malam',
      jp: '泊',
    },
    {
      key: 'booking.nights',
      description: 'Nights plural',
      en: 'nights',
      id: 'malam',
      jp: '泊',
    },
    {
      key: 'booking.book_button',
      description: 'Book button with total',
      en: 'Book — {{total}}',
      id: 'Pesan — {{total}}',
      jp: '予約 — {{total}}',
    },
    {
      key: 'booking.select_dates',
      description: 'Select dates prompt',
      en: 'Select dates to book',
      id: 'Pilih tanggal untuk memesan',
      jp: '予約する日付を選択',
    },
    // ── Calendar ────────────────────────────────────────────
    {
      key: 'calendar.available',
      description: 'Calendar available label',
      en: 'Available',
      id: 'Tersedia',
      jp: '空室',
    },
    {
      key: 'calendar.unavailable',
      description: 'Calendar unavailable label',
      en: 'Unavailable',
      id: 'Tidak tersedia',
      jp: '満室',
    },
    {
      key: 'calendar.sun',
      description: 'Sunday abbreviation',
      en: 'Sun',
      id: 'Min',
      jp: '日',
    },
    {
      key: 'calendar.mon',
      description: 'Monday abbreviation',
      en: 'Mon',
      id: 'Sen',
      jp: '月',
    },
    {
      key: 'calendar.tue',
      description: 'Tuesday abbreviation',
      en: 'Tue',
      id: 'Sel',
      jp: '火',
    },
    {
      key: 'calendar.wed',
      description: 'Wednesday abbreviation',
      en: 'Wed',
      id: 'Rab',
      jp: '水',
    },
    {
      key: 'calendar.thu',
      description: 'Thursday abbreviation',
      en: 'Thu',
      id: 'Kam',
      jp: '木',
    },
    {
      key: 'calendar.fri',
      description: 'Friday abbreviation',
      en: 'Fri',
      id: 'Jum',
      jp: '金',
    },
    {
      key: 'calendar.sat',
      description: 'Saturday abbreviation',
      en: 'Sat',
      id: 'Sab',
      jp: '土',
    },
    // ── Reviews ─────────────────────────────────────────────
    {
      key: 'reviews.title',
      description: 'Reviews heading',
      en: 'Reviews',
      id: 'Ulasan',
      jp: 'レビュー',
    },
    {
      key: 'reviews.empty_title',
      description: 'No reviews title',
      en: 'No reviews yet',
      id: 'Belum ada ulasan',
      jp: 'レビューはまだありません',
    },
    {
      key: 'reviews.empty_description',
      description: 'No reviews description',
      en: 'Be the first to review this villa after your stay.',
      id: 'Jadilah yang pertama mengulas villa ini setelah menginap.',
      jp: '滞在後、最初のレビューを書いてみましょう。',
    },
    // ── Dashboard ───────────────────────────────────────────
    {
      key: 'dashboard.title',
      description: 'Dashboard title',
      en: 'Dashboard',
      id: 'Dasbor',
      jp: 'ダッシュボード',
    },
    {
      key: 'dashboard.welcome',
      description: 'Dashboard welcome message',
      en: 'Welcome back, {{name}}',
      id: 'Selamat datang kembali, {{name}}',
      jp: 'おかえりなさい、{{name}}',
    },
    {
      key: 'dashboard.wallet_balance',
      description: 'Wallet balance card title',
      en: 'Wallet Balance',
      id: 'Saldo Dompet',
      jp: 'ウォレット残高',
    },
    {
      key: 'dashboard.manage_wallet',
      description: 'Manage wallet link',
      en: 'Manage wallet →',
      id: 'Kelola dompet →',
      jp: 'ウォレット管理 →',
    },
    {
      key: 'dashboard.my_bookings',
      description: 'My bookings card title',
      en: 'My Bookings',
      id: 'Pemesanan Saya',
      jp: 'マイ予約',
    },
    {
      key: 'dashboard.view_bookings',
      description: 'View bookings link',
      en: 'View bookings',
      id: 'Lihat pemesanan',
      jp: '予約を見る',
    },
    {
      key: 'dashboard.transactions_title',
      description: 'Transactions card title',
      en: 'Transactions',
      id: 'Transaksi',
      jp: '取引',
    },
    {
      key: 'dashboard.view_history',
      description: 'View history link',
      en: 'View history',
      id: 'Lihat riwayat',
      jp: '履歴を見る',
    },
    // ── Dashboard Bookings ──────────────────────────────────
    {
      key: 'bookings.title',
      description: 'Bookings page title',
      en: 'My Bookings',
      id: 'Pemesanan Saya',
      jp: 'マイ予約',
    },
    {
      key: 'bookings.subtitle',
      description: 'Bookings page subtitle',
      en: 'View and manage your villa bookings',
      id: 'Lihat dan kelola pemesanan villa Anda',
      jp: 'ヴィラの予約を表示・管理',
    },
    {
      key: 'bookings.empty_title',
      description: 'No bookings title',
      en: 'No bookings yet',
      id: 'Belum ada pemesanan',
      jp: '予約はまだありません',
    },
    {
      key: 'bookings.empty_description',
      description: 'No bookings description',
      en: 'Start exploring villas and book your next getaway.',
      id: 'Mulai jelajahi villa dan pesan liburan berikutnya.',
      jp: 'ヴィラを探索して、次の旅行を予約しましょう。',
    },
    {
      key: 'bookings.browse',
      description: 'Browse villas link',
      en: 'Browse villas →',
      id: 'Lihat villa →',
      jp: 'ヴィラを見る →',
    },
    {
      key: 'bookings.pay_now',
      description: 'Pay now button',
      en: 'Pay Now',
      id: 'Bayar Sekarang',
      jp: '今すぐ支払う',
    },
    {
      key: 'bookings.cancel',
      description: 'Cancel booking button',
      en: 'Cancel',
      id: 'Batalkan',
      jp: 'キャンセル',
    },
    // ── Dashboard Profile ───────────────────────────────────
    {
      key: 'profile.title',
      description: 'Profile page title',
      en: 'Profile',
      id: 'Profil',
      jp: 'プロフィール',
    },
    {
      key: 'profile.subtitle',
      description: 'Profile page subtitle',
      en: 'Manage your account information',
      id: 'Kelola informasi akun Anda',
      jp: 'アカウント情報を管理',
    },
    {
      key: 'profile.account_details',
      description: 'Account details card title',
      en: 'Account Details',
      id: 'Detail Akun',
      jp: 'アカウント詳細',
    },
    {
      key: 'profile.email',
      description: 'Email label',
      en: 'Email',
      id: 'Email',
      jp: 'メールアドレス',
    },
    {
      key: 'profile.email_hint',
      description: 'Email hint text',
      en: 'Email cannot be changed',
      id: 'Email tidak dapat diubah',
      jp: 'メールアドレスは変更できません',
    },
    {
      key: 'profile.fullname',
      description: 'Full name label',
      en: 'Full Name',
      id: 'Nama Lengkap',
      jp: '氏名',
    },
    {
      key: 'profile.save',
      description: 'Save changes button',
      en: 'Save Changes',
      id: 'Simpan Perubahan',
      jp: '変更を保存',
    },
    // ── Dashboard Wallet ────────────────────────────────────
    {
      key: 'wallet.title',
      description: 'Wallet page title',
      en: 'Wallet',
      id: 'Dompet',
      jp: 'ウォレット',
    },
    {
      key: 'wallet.transaction_history',
      description: 'Transaction history heading',
      en: 'Transaction History',
      id: 'Riwayat Transaksi',
      jp: '取引履歴',
    },
    {
      key: 'wallet.subtitle',
      description: 'Wallet page subtitle',
      en: 'Manage your balance, deposits, and withdrawals',
      id: 'Kelola saldo, deposit, dan penarikan Anda',
      jp: '残高、入金、出金を管理',
    },
    {
      key: 'wallet.current_balance',
      description: 'Current balance label',
      en: 'Current Balance',
      id: 'Saldo Saat Ini',
      jp: '現在の残高',
    },
    {
      key: 'wallet.tx_history',
      description: 'Transaction history heading',
      en: 'Transaction History',
      id: 'Riwayat Transaksi',
      jp: '取引履歴',
    },
    {
      key: 'wallet.no_transactions',
      description: 'No transactions message',
      en: 'No transactions yet.',
      id: 'Belum ada transaksi.',
      jp: '取引はまだありません。',
    },
    {
      key: 'wallet.deposit',
      description: 'Deposit button/tab',
      en: 'Deposit',
      id: 'Deposit',
      jp: '入金',
    },
    {
      key: 'wallet.deposit_unavailable',
      description: 'Deposit unavailable message',
      en: 'Deposits are currently unavailable.',
      id: 'Deposit saat ini tidak tersedia.',
      jp: '現在、入金はご利用いただけません。',
    },
    {
      key: 'wallet.amount',
      description: 'Amount label',
      en: 'Amount (Rp)',
      id: 'Jumlah (Rp)',
      jp: '金額 (Rp)',
    },
    {
      key: 'wallet.deposit_transfer',
      description: 'Deposit via transfer button',
      en: 'Deposit via Transfer',
      id: 'Deposit via Transfer',
      jp: '振込で入金',
    },
    {
      key: 'wallet.pay_gateway',
      description: 'Pay with gateway button',
      en: 'Pay with Gateway',
      id: 'Bayar dengan Gateway',
      jp: 'ゲートウェイで支払う',
    },
    {
      key: 'wallet.withdraw',
      description: 'Withdraw button/tab',
      en: 'Withdraw',
      id: 'Tarik',
      jp: '出金',
    },
    {
      key: 'wallet.withdraw_unavailable',
      description: 'Withdraw unavailable message',
      en: 'Withdrawals are currently unavailable.',
      id: 'Penarikan saat ini tidak tersedia.',
      jp: '現在、出金はご利用いただけません。',
    },
    {
      key: 'wallet.bank_name',
      description: 'Bank name label',
      en: 'Bank Name',
      id: 'Nama Bank',
      jp: '銀行名',
    },
    {
      key: 'wallet.account_number',
      description: 'Account number label',
      en: 'Account Number',
      id: 'Nomor Rekening',
      jp: '口座番号',
    },
    {
      key: 'wallet.request_withdrawal',
      description: 'Request withdrawal button',
      en: 'Request Withdrawal',
      id: 'Ajukan Penarikan',
      jp: '出金をリクエスト',
    },
    {
      key: 'wallet.withdraw_gateway',
      description: 'Withdraw via gateway button',
      en: 'Withdraw via Gateway',
      id: 'Tarik via Gateway',
      jp: 'ゲートウェイで出金',
    },
    // ── Deposit detail ──────────────────────────────────────
    {
      key: 'deposit.complete',
      description: 'Complete deposit heading',
      en: 'Complete Deposit',
      id: 'Selesaikan Deposit',
      jp: '入金を完了',
    },
    {
      key: 'deposit.tx_id',
      description: 'Transaction ID label',
      en: 'Transaction ID:',
      id: 'ID Transaksi:',
      jp: '取引ID:',
    },
    {
      key: 'deposit.amount',
      description: 'Deposit amount label',
      en: 'Deposit Amount',
      id: 'Jumlah Deposit',
      jp: '入金額',
    },
    {
      key: 'deposit.transfer_to',
      description: 'Transfer to heading',
      en: 'Transfer To',
      id: 'Transfer Ke',
      jp: '送金先',
    },
    {
      key: 'deposit.bank_wallet',
      description: 'Bank / Wallet label',
      en: 'Bank / Wallet',
      id: 'Bank / Dompet',
      jp: '銀行 / ウォレット',
    },
    {
      key: 'deposit.account_name',
      description: 'Account name label',
      en: 'Account Name',
      id: 'Nama Akun',
      jp: '口座名',
    },
    {
      key: 'deposit.account_number',
      description: 'Account number label',
      en: 'Account Number',
      id: 'Nomor Rekening',
      jp: '口座番号',
    },
    {
      key: 'deposit.scan_qr',
      description: 'Scan QR label',
      en: 'Scan QR to pay',
      id: 'Scan QR untuk bayar',
      jp: 'QRをスキャンして支払い',
    },
    {
      key: 'deposit.instructions',
      description: 'Instructions label',
      en: 'Instructions',
      id: 'Instruksi',
      jp: '手順',
    },
    {
      key: 'deposit.rejection_reason',
      description: 'Rejection reason label',
      en: 'Rejection reason',
      id: 'Alasan penolakan',
      jp: '拒否理由',
    },
    {
      key: 'deposit.under_review',
      description: 'Under review heading',
      en: 'Under review',
      id: 'Sedang ditinjau',
      jp: '審査中',
    },
    {
      key: 'deposit.review_message',
      description: 'Review message text',
      en: 'Your payment evidence is being reviewed by our team. This usually takes 1–2 business hours.',
      id: 'Bukti pembayaran Anda sedang ditinjau oleh tim kami. Biasanya memakan waktu 1–2 jam kerja.',
      jp: 'お支払い証拠はチームが確認中です。通常1〜2営業時間かかります。',
    },
    {
      key: 'deposit.approved',
      description: 'Deposit approved heading',
      en: 'Deposit approved',
      id: 'Deposit disetujui',
      jp: '入金が承認されました',
    },
    {
      key: 'deposit.credited',
      description: 'Deposit credited message',
      en: '{{amount}} has been credited to your wallet.',
      id: '{{amount}} telah dikreditkan ke dompet Anda.',
      jp: '{{amount}}がウォレットに入金されました。',
    },
    {
      key: 'deposit.upload_title',
      description: 'Upload evidence title',
      en: 'Upload Transfer Evidence',
      id: 'Unggah Bukti Transfer',
      jp: '送金証拠をアップロード',
    },
    {
      key: 'deposit.upload_hint',
      description: 'Upload evidence hint',
      en: 'Upload a screenshot or photo of your transfer confirmation.',
      id: 'Unggah screenshot atau foto konfirmasi transfer Anda.',
      jp: '送金確認のスクリーンショットまたは写真をアップロードしてください。',
    },
    {
      key: 'deposit.drop_file',
      description: 'Drop file text',
      en: 'Drop file here or click to browse',
      id: 'Letakkan file di sini atau klik untuk memilih',
      jp: 'ファイルをドロップするかクリックして選択',
    },
    {
      key: 'deposit.file_types',
      description: 'File types hint',
      en: 'JPG, PNG, WEBP — max 5MB',
      id: 'JPG, PNG, WEBP — maks 5MB',
      jp: 'JPG, PNG, WEBP — 最大5MB',
    },
    {
      key: 'deposit.uploading',
      description: 'Uploading text',
      en: 'Uploading…',
      id: 'Mengunggah…',
      jp: 'アップロード中…',
    },
    {
      key: 'deposit.submitting',
      description: 'Submitting text',
      en: 'Submitting…',
      id: 'Mengirim…',
      jp: '送信中…',
    },
    {
      key: 'deposit.submit_evidence',
      description: 'Submit evidence button',
      en: 'Submit Evidence',
      id: 'Kirim Bukti',
      jp: '証拠を送信',
    },
    {
      key: 'deposit.submitted_evidence',
      description: 'Submitted evidence heading',
      en: 'Submitted Evidence',
      id: 'Bukti yang Dikirim',
      jp: '送信済みの証拠',
    },
    {
      key: 'deposit.status.pending',
      description: 'Deposit status pending',
      en: 'Awaiting Payment',
      id: 'Menunggu Pembayaran',
      jp: '支払い待ち',
    },
    {
      key: 'deposit.status.pending_verification',
      description: 'Deposit status pending verification',
      en: 'Pending Verification',
      id: 'Menunggu Verifikasi',
      jp: '確認待ち',
    },
    {
      key: 'deposit.status.approved',
      description: 'Deposit status approved',
      en: 'Approved',
      id: 'Disetujui',
      jp: '承認済み',
    },
    {
      key: 'deposit.status.rejected',
      description: 'Deposit status rejected',
      en: 'Rejected',
      id: 'Ditolak',
      jp: '拒否',
    },
    {
      key: 'deposit.status.cancelled',
      description: 'Deposit status cancelled',
      en: 'Cancelled',
      id: 'Dibatalkan',
      jp: 'キャンセル済み',
    },
    // ── Admin analytics ─────────────────────────────────────
    {
      key: 'admin.analytics.title',
      description: 'Admin analytics title',
      en: 'Analytics',
      id: 'Analitik',
      jp: 'アナリティクス',
    },
    {
      key: 'admin.analytics.subtitle',
      description: 'Admin analytics subtitle',
      en: 'Platform overview and key metrics',
      id: 'Ringkasan platform dan metrik utama',
      jp: 'プラットフォームの概要と主要指標',
    },
    {
      key: 'admin.analytics.total_revenue',
      description: 'Total revenue card',
      en: 'Total Revenue',
      id: 'Total Pendapatan',
      jp: '総収入',
    },
    {
      key: 'admin.analytics.active_bookings',
      description: 'Active bookings card',
      en: 'Active Bookings',
      id: 'Pemesanan Aktif',
      jp: 'アクティブ予約',
    },
    {
      key: 'admin.analytics.total_bookings',
      description: 'Total bookings card',
      en: 'Total Bookings',
      id: 'Total Pemesanan',
      jp: '総予約数',
    },
    {
      key: 'admin.analytics.total_users',
      description: 'Total users card',
      en: 'Total Users',
      id: 'Total Pengguna',
      jp: '総ユーザー数',
    },
    {
      key: 'admin.analytics.total_villas',
      description: 'Total villas card',
      en: 'Total Villas',
      id: 'Total Villa',
      jp: '総ヴィラ数',
    },
    {
      key: 'admin.analytics.pending_transactions',
      description: 'Pending transactions card',
      en: 'Pending Transactions',
      id: 'Transaksi Tertunda',
      jp: '保留中の取引',
    },
    // ── Admin bookings ──────────────────────────────────────
    {
      key: 'admin.bookings.title',
      description: 'Admin bookings title',
      en: 'Booking Management',
      id: 'Manajemen Pemesanan',
      jp: '予約管理',
    },
    {
      key: 'admin.bookings.subtitle',
      description: 'Admin bookings subtitle',
      en: 'View and manage all bookings',
      id: 'Lihat dan kelola semua pemesanan',
      jp: 'すべての予約を表示・管理',
    },
    {
      key: 'admin.bookings.col_villa',
      description: 'Bookings column villa',
      en: 'Villa',
      id: 'Villa',
      jp: 'ヴィラ',
    },
    {
      key: 'admin.bookings.col_guest',
      description: 'Bookings column guest',
      en: 'Guest',
      id: 'Tamu',
      jp: 'ゲスト',
    },
    {
      key: 'admin.bookings.col_dates',
      description: 'Bookings column dates',
      en: 'Dates',
      id: 'Tanggal',
      jp: '日程',
    },
    {
      key: 'admin.bookings.col_total',
      description: 'Bookings column total',
      en: 'Total',
      id: 'Total',
      jp: '合計',
    },
    {
      key: 'admin.bookings.col_status',
      description: 'Bookings column status',
      en: 'Status',
      id: 'Status',
      jp: 'ステータス',
    },
    {
      key: 'admin.bookings.empty',
      description: 'No bookings found',
      en: 'No bookings found.',
      id: 'Tidak ada pemesanan ditemukan.',
      jp: '予約が見つかりません。',
    },
    {
      key: 'admin.bookings.all_statuses',
      description: 'All statuses filter',
      en: 'All statuses',
      id: 'Semua status',
      jp: 'すべてのステータス',
    },
    {
      key: 'admin.bookings.status_pending',
      description: 'Status pending',
      en: 'Pending',
      id: 'Tertunda',
      jp: '保留中',
    },
    {
      key: 'admin.bookings.status_paid',
      description: 'Status paid',
      en: 'Paid',
      id: 'Dibayar',
      jp: '支払済',
    },
    {
      key: 'admin.bookings.status_cancelled',
      description: 'Status cancelled',
      en: 'Cancelled',
      id: 'Dibatalkan',
      jp: 'キャンセル済',
    },
    {
      key: 'admin.bookings.status_expired',
      description: 'Status expired',
      en: 'Expired',
      id: 'Kedaluwarsa',
      jp: '期限切れ',
    },
    // ── Admin villas ────────────────────────────────────────
    {
      key: 'admin.villas.title',
      description: 'Admin villas title',
      en: 'Villa Management',
      id: 'Manajemen Villa',
      jp: 'ヴィラ管理',
    },
    {
      key: 'admin.villas.subtitle',
      description: 'Admin villas subtitle',
      en: 'Create, edit, and manage villas',
      id: 'Buat, edit, dan kelola villa',
      jp: 'ヴィラの作成、編集、管理',
    },
    {
      key: 'admin.villas.add',
      description: 'Add villa button',
      en: 'Add Villa',
      id: 'Tambah Villa',
      jp: 'ヴィラを追加',
    },
    {
      key: 'admin.villas.col_title',
      description: 'Villas column title',
      en: 'Title',
      id: 'Judul',
      jp: 'タイトル',
    },
    {
      key: 'admin.villas.col_location',
      description: 'Villas column location',
      en: 'Location',
      id: 'Lokasi',
      jp: '場所',
    },
    {
      key: 'admin.villas.col_price',
      description: 'Villas column price',
      en: 'Price/Night',
      id: 'Harga/Malam',
      jp: '1泊料金',
    },
    {
      key: 'admin.villas.col_guests',
      description: 'Villas column guests',
      en: 'Guests',
      id: 'Tamu',
      jp: 'ゲスト',
    },
    {
      key: 'admin.villas.search',
      description: 'Search villas placeholder',
      en: 'Search villas...',
      id: 'Cari villa...',
      jp: 'ヴィラを検索...',
    },
    {
      key: 'admin.villas.empty',
      description: 'No villas found',
      en: 'No villas found.',
      id: 'Tidak ada villa ditemukan.',
      jp: 'ヴィラが見つかりません。',
    },
    {
      key: 'admin.villas.create_title',
      description: 'Create villa page title',
      en: 'Create Villa',
      id: 'Buat Villa',
      jp: 'ヴィラを作成',
    },
    {
      key: 'admin.villas.create_subtitle',
      description: 'Create villa subtitle',
      en: 'Add a new villa to the platform',
      id: 'Tambahkan villa baru ke platform',
      jp: 'プラットフォームに新しいヴィラを追加',
    },
    {
      key: 'admin.villas.edit_title',
      description: 'Edit villa page title',
      en: 'Edit Villa',
      id: 'Edit Villa',
      jp: 'ヴィラを編集',
    },
    {
      key: 'admin.villas.form_title',
      description: 'Villa form title label',
      en: 'Title',
      id: 'Judul',
      jp: 'タイトル',
    },
    {
      key: 'admin.villas.form_slug',
      description: 'Villa form slug label',
      en: 'Slug',
      id: 'Slug',
      jp: 'スラッグ',
    },
    {
      key: 'admin.villas.form_description',
      description: 'Villa form description label',
      en: 'Description',
      id: 'Deskripsi',
      jp: '説明',
    },
    {
      key: 'admin.villas.form_location',
      description: 'Villa form location label',
      en: 'Location',
      id: 'Lokasi',
      jp: '場所',
    },
    {
      key: 'admin.villas.form_price',
      description: 'Villa form price label',
      en: 'Price per Night (Rp)',
      id: 'Harga per Malam (Rp)',
      jp: '1泊料金 (Rp)',
    },
    {
      key: 'admin.villas.form_max_guests',
      description: 'Villa form max guests label',
      en: 'Max Guests',
      id: 'Maks Tamu',
      jp: '最大ゲスト数',
    },
    {
      key: 'admin.villas.form_save',
      description: 'Villa form save button',
      en: 'Save Changes',
      id: 'Simpan Perubahan',
      jp: '変更を保存',
    },
    {
      key: 'admin.villas.form_cancel',
      description: 'Villa form cancel button',
      en: 'Cancel',
      id: 'Batal',
      jp: 'キャンセル',
    },
    {
      key: 'admin.villas.confirm_delete',
      description: 'Villa delete confirmation',
      en: 'Delete "{{title}}"? This cannot be undone.',
      id: 'Hapus "{{title}}"? Ini tidak dapat dibatalkan.',
      jp: '"{{title}}"を削除しますか？元に戻せません。',
    },
    // ── Admin users ─────────────────────────────────────────
    {
      key: 'admin.users.title',
      description: 'Admin users title',
      en: 'User Management',
      id: 'Manajemen Pengguna',
      jp: 'ユーザー管理',
    },
    {
      key: 'admin.users.subtitle',
      description: 'Admin users subtitle',
      en: 'Manage users and their roles',
      id: 'Kelola pengguna dan peran mereka',
      jp: 'ユーザーとロールを管理',
    },
    {
      key: 'admin.users.col_name',
      description: 'Users column name',
      en: 'Name',
      id: 'Nama',
      jp: '名前',
    },
    {
      key: 'admin.users.col_role',
      description: 'Users column role',
      en: 'Role',
      id: 'Peran',
      jp: 'ロール',
    },
    {
      key: 'admin.users.col_balance',
      description: 'Users column balance',
      en: 'Balance',
      id: 'Saldo',
      jp: '残高',
    },
    {
      key: 'admin.users.col_joined',
      description: 'Users column joined',
      en: 'Joined',
      id: 'Bergabung',
      jp: '参加日',
    },
    {
      key: 'admin.users.search',
      description: 'Search users placeholder',
      en: 'Search users...',
      id: 'Cari pengguna...',
      jp: 'ユーザーを検索...',
    },
    {
      key: 'admin.users.empty',
      description: 'No users found',
      en: 'No users found.',
      id: 'Tidak ada pengguna ditemukan.',
      jp: 'ユーザーが見つかりません。',
    },
    {
      key: 'admin.users.role_user',
      description: 'User role label',
      en: 'User',
      id: 'Pengguna',
      jp: 'ユーザー',
    },
    {
      key: 'admin.users.role_admin',
      description: 'Admin role label',
      en: 'Admin',
      id: 'Admin',
      jp: '管理者',
    },
    // ── Admin reviews ───────────────────────────────────────
    {
      key: 'admin.reviews.title',
      description: 'Admin reviews title',
      en: 'Review Moderation',
      id: 'Moderasi Ulasan',
      jp: 'レビューの管理',
    },
    {
      key: 'admin.reviews.subtitle',
      description: 'Admin reviews subtitle',
      en: 'Monitor and moderate user reviews',
      id: 'Pantau dan moderasi ulasan pengguna',
      jp: 'ユーザーレビューの監視・管理',
    },
    {
      key: 'admin.reviews.col_user',
      description: 'Reviews column user',
      en: 'User',
      id: 'Pengguna',
      jp: 'ユーザー',
    },
    {
      key: 'admin.reviews.col_rating',
      description: 'Reviews column rating',
      en: 'Rating',
      id: 'Penilaian',
      jp: '評価',
    },
    {
      key: 'admin.reviews.col_comment',
      description: 'Reviews column comment',
      en: 'Comment',
      id: 'Komentar',
      jp: 'コメント',
    },
    {
      key: 'admin.reviews.col_date',
      description: 'Reviews column date',
      en: 'Date',
      id: 'Tanggal',
      jp: '日付',
    },
    {
      key: 'admin.reviews.empty',
      description: 'No reviews found',
      en: 'No reviews found.',
      id: 'Tidak ada ulasan ditemukan.',
      jp: 'レビューが見つかりません。',
    },
    {
      key: 'admin.reviews.confirm_delete',
      description: 'Review delete confirmation',
      en: 'Delete this review? This cannot be undone.',
      id: 'Hapus ulasan ini? Ini tidak dapat dibatalkan.',
      jp: 'このレビューを削除しますか？元に戻せません。',
    },
    // ── Admin transactions ──────────────────────────────────
    {
      key: 'admin.tx.title',
      description: 'Admin transactions title',
      en: 'Transaction Management',
      id: 'Manajemen Transaksi',
      jp: '取引管理',
    },
    {
      key: 'admin.tx.subtitle',
      description: 'Admin transactions subtitle',
      en: 'Manage deposits and withdrawals',
      id: 'Kelola deposit dan penarikan',
      jp: '入金と出金を管理',
    },
    {
      key: 'admin.tx.deposits',
      description: 'Deposits heading',
      en: 'Deposits',
      id: 'Deposit',
      jp: '入金',
    },
    {
      key: 'admin.tx.withdrawals',
      description: 'Withdrawals heading',
      en: 'Withdrawals',
      id: 'Penarikan',
      jp: '出金',
    },
    {
      key: 'admin.tx.col_user',
      description: 'Transactions column user',
      en: 'User',
      id: 'Pengguna',
      jp: 'ユーザー',
    },
    {
      key: 'admin.tx.col_amount',
      description: 'Transactions column amount',
      en: 'Amount',
      id: 'Jumlah',
      jp: '金額',
    },
    {
      key: 'admin.tx.col_evidence',
      description: 'Transactions column evidence',
      en: 'Evidence',
      id: 'Bukti',
      jp: '証拠',
    },
    {
      key: 'admin.tx.col_status',
      description: 'Transactions column status',
      en: 'Status',
      id: 'Status',
      jp: 'ステータス',
    },
    {
      key: 'admin.tx.col_date',
      description: 'Transactions column date',
      en: 'Date',
      id: 'Tanggal',
      jp: '日付',
    },
    {
      key: 'admin.tx.col_bank',
      description: 'Transactions column bank',
      en: 'Bank Account',
      id: 'Rekening Bank',
      jp: '銀行口座',
    },
    {
      key: 'admin.tx.deposits_empty',
      description: 'No deposits found',
      en: 'No deposits found.',
      id: 'Tidak ada deposit ditemukan.',
      jp: '入金が見つかりません。',
    },
    {
      key: 'admin.tx.withdrawals_empty',
      description: 'No withdrawals found',
      en: 'No withdrawals found.',
      id: 'Tidak ada penarikan ditemukan.',
      jp: '出金が見つかりません。',
    },
    {
      key: 'admin.tx.approve',
      description: 'Approve button',
      en: 'Approve',
      id: 'Setujui',
      jp: '承認',
    },
    {
      key: 'admin.tx.complete',
      description: 'Complete button',
      en: 'Complete',
      id: 'Selesaikan',
      jp: '完了',
    },
    {
      key: 'admin.tx.reject',
      description: 'Reject button',
      en: 'Reject',
      id: 'Tolak',
      jp: '拒否',
    },
    {
      key: 'admin.tx.note_placeholder',
      description: 'Note placeholder',
      en: 'Note (optional)',
      id: 'Catatan (opsional)',
      jp: 'メモ（任意）',
    },
    {
      key: 'admin.tx.deposit_approved',
      description: 'Deposit approved toast',
      en: 'Deposit approved',
      id: 'Deposit disetujui',
      jp: '入金が承認されました',
    },
    {
      key: 'admin.tx.deposit_rejected',
      description: 'Deposit rejected toast',
      en: 'Deposit rejected',
      id: 'Deposit ditolak',
      jp: '入金が拒否されました',
    },
    {
      key: 'admin.tx.deposit_completed',
      description: 'Deposit completed toast',
      en: 'Deposit completed',
      id: 'Deposit selesai',
      jp: '入金が完了しました',
    },
    {
      key: 'admin.tx.withdrawal_approved',
      description: 'Withdrawal approved toast',
      en: 'Withdrawal approved',
      id: 'Penarikan disetujui',
      jp: '出金が承認されました',
    },
    {
      key: 'admin.tx.withdrawal_rejected',
      description: 'Withdrawal rejected toast',
      en: 'Withdrawal rejected',
      id: 'Penarikan ditolak',
      jp: '出金が拒否されました',
    },
    {
      key: 'admin.tx.withdrawal_completed',
      description: 'Withdrawal completed toast',
      en: 'Withdrawal completed',
      id: 'Penarikan selesai',
      jp: '出金が完了しました',
    },
    // ── Admin receiver accounts ─────────────────────────────
    {
      key: 'admin.receiver.title',
      description: 'Receiver accounts title',
      en: 'Receiver Accounts',
      id: 'Akun Penerima',
      jp: '受取口座',
    },
    {
      key: 'admin.receiver.subtitle',
      description: 'Receiver accounts subtitle',
      en: 'Manage bank/e-wallet accounts shown during manual deposit',
      id: 'Kelola akun bank/e-wallet yang ditampilkan saat deposit manual',
      jp: '手動入金時に表示される銀行/電子ウォレット口座を管理',
    },
    {
      key: 'admin.receiver.add',
      description: 'Add account button',
      en: 'Add Account',
      id: 'Tambah Akun',
      jp: 'アカウントを追加',
    },
    {
      key: 'admin.receiver.edit_account',
      description: 'Edit account title',
      en: 'Edit Account',
      id: 'Edit Akun',
      jp: 'アカウントを編集',
    },
    {
      key: 'admin.receiver.new_account',
      description: 'New account title',
      en: 'New Account',
      id: 'Akun Baru',
      jp: '新しいアカウント',
    },
    {
      key: 'admin.receiver.bank_name',
      description: 'Bank/Wallet name label',
      en: 'Bank / Wallet Name *',
      id: 'Nama Bank / Dompet *',
      jp: '銀行 / ウォレット名 *',
    },
    {
      key: 'admin.receiver.account_name',
      description: 'Account name label',
      en: 'Account Name *',
      id: 'Nama Akun *',
      jp: '口座名 *',
    },
    {
      key: 'admin.receiver.account_number',
      description: 'Account number label',
      en: 'Account Number *',
      id: 'Nomor Rekening *',
      jp: '口座番号 *',
    },
    {
      key: 'admin.receiver.payment_type',
      description: 'Payment type label',
      en: 'Payment Type',
      id: 'Jenis Pembayaran',
      jp: '支払い種別',
    },
    {
      key: 'admin.receiver.bank_transfer',
      description: 'Bank transfer option',
      en: 'Bank Transfer',
      id: 'Transfer Bank',
      jp: '銀行振込',
    },
    {
      key: 'admin.receiver.e_wallet',
      description: 'E-Wallet option',
      en: 'E-Wallet',
      id: 'E-Wallet',
      jp: '電子ウォレット',
    },
    {
      key: 'admin.receiver.instructions',
      description: 'Transfer instructions label',
      en: 'Transfer Instructions',
      id: 'Instruksi Transfer',
      jp: '送金手順',
    },
    {
      key: 'admin.receiver.display_order',
      description: 'Display order label',
      en: 'Display Order',
      id: 'Urutan Tampilan',
      jp: '表示順',
    },
    {
      key: 'admin.receiver.active',
      description: 'Active checkbox',
      en: 'Active',
      id: 'Aktif',
      jp: '有効',
    },
    {
      key: 'admin.receiver.default',
      description: 'Default checkbox/badge',
      en: 'Default',
      id: 'Default',
      jp: 'デフォルト',
    },
    {
      key: 'admin.receiver.qr_image',
      description: 'QR image label',
      en: 'QR Image',
      id: 'Gambar QR',
      jp: 'QR画像',
    },
    {
      key: 'admin.receiver.upload_qr',
      description: 'Upload QR button',
      en: 'Upload QR',
      id: 'Unggah QR',
      jp: 'QRをアップロード',
    },
    {
      key: 'admin.receiver.qr_hint',
      description: 'QR file hint',
      en: 'PNG/JPG — max 2MB',
      id: 'PNG/JPG — maks 2MB',
      jp: 'PNG/JPG — 最大2MB',
    },
    {
      key: 'admin.receiver.save',
      description: 'Save changes button',
      en: 'Save Changes',
      id: 'Simpan Perubahan',
      jp: '変更を保存',
    },
    {
      key: 'admin.receiver.create',
      description: 'Create account button',
      en: 'Create Account',
      id: 'Buat Akun',
      jp: 'アカウントを作成',
    },
    {
      key: 'admin.receiver.empty',
      description: 'No accounts message',
      en: 'No receiver accounts yet.',
      id: 'Belum ada akun penerima.',
      jp: '受取口座はまだありません。',
    },
    {
      key: 'admin.receiver.no_qr',
      description: 'No QR placeholder',
      en: 'No QR',
      id: 'Tidak ada QR',
      jp: 'QRなし',
    },
    {
      key: 'admin.receiver.bank',
      description: 'Bank badge',
      en: 'Bank',
      id: 'Bank',
      jp: '銀行',
    },
    {
      key: 'admin.receiver.inactive',
      description: 'Inactive badge',
      en: 'Inactive',
      id: 'Nonaktif',
      jp: '無効',
    },
    {
      key: 'admin.receiver.edit',
      description: 'Edit button',
      en: 'Edit',
      id: 'Edit',
      jp: '編集',
    },
    {
      key: 'admin.receiver.deactivate',
      description: 'Deactivate button',
      en: 'Deactivate',
      id: 'Nonaktifkan',
      jp: '無効化',
    },
    {
      key: 'admin.receiver.activate',
      description: 'Activate button',
      en: 'Activate',
      id: 'Aktifkan',
      jp: '有効化',
    },
    {
      key: 'admin.receiver.confirm_delete',
      description: 'Delete account confirmation',
      en: 'Delete this receiver account?',
      id: 'Hapus akun penerima ini?',
      jp: 'この受取口座を削除しますか？',
    },
    // ── Admin feature flags ─────────────────────────────────
    {
      key: 'admin.flags.title',
      description: 'Feature flags title',
      en: 'Feature Flags',
      id: 'Pengaturan Fitur',
      jp: '機能フラグ',
    },
    {
      key: 'admin.flags.subtitle',
      description: 'Feature flags subtitle',
      en: 'Control payment system behaviour dynamically',
      id: 'Kontrol perilaku sistem pembayaran secara dinamis',
      jp: '決済システムの動作を動的に制御',
    },
    {
      key: 'admin.flags.new',
      description: 'New flag button',
      en: 'New Flag',
      id: 'Flag Baru',
      jp: '新しいフラグ',
    },
    {
      key: 'admin.flags.create_title',
      description: 'Create flag title',
      en: 'Create Feature Flag',
      id: 'Buat Feature Flag',
      jp: '機能フラグを作成',
    },
    {
      key: 'admin.flags.key',
      description: 'Flag key label',
      en: 'Key',
      id: 'Key',
      jp: 'キー',
    },
    {
      key: 'admin.flags.value',
      description: 'Flag value label',
      en: 'Value',
      id: 'Nilai',
      jp: '値',
    },
    {
      key: 'admin.flags.type',
      description: 'Flag type label',
      en: 'Type',
      id: 'Tipe',
      jp: 'タイプ',
    },
    {
      key: 'admin.flags.description',
      description: 'Flag description label',
      en: 'Description',
      id: 'Deskripsi',
      jp: '説明',
    },
    {
      key: 'admin.flags.create',
      description: 'Create flag button',
      en: 'Create',
      id: 'Buat',
      jp: '作成',
    },
    {
      key: 'admin.flags.payment_title',
      description: 'Payment flags section title',
      en: 'Payment System Flags',
      id: 'Flag Sistem Pembayaran',
      jp: '決済システムフラグ',
    },
    {
      key: 'admin.flags.payment_empty',
      description: 'No payment flags message',
      en: 'No payment flags found. Create them above.',
      id: 'Tidak ada flag pembayaran. Buat di atas.',
      jp: '決済フラグが見つかりません。上で作成してください。',
    },
    {
      key: 'admin.flags.other_title',
      description: 'Other flags section title',
      en: 'Other Flags',
      id: 'Flag Lainnya',
      jp: 'その他のフラグ',
    },
    {
      key: 'admin.flags.save',
      description: 'Save flag button',
      en: 'Save',
      id: 'Simpan',
      jp: '保存',
    },
    {
      key: 'admin.flags.inactive',
      description: 'Inactive badge',
      en: 'inactive',
      id: 'nonaktif',
      jp: '無効',
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
