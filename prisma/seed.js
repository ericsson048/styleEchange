/* eslint-disable no-console */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const placeholder = require("../src/app/lib/placeholder-images.json");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ph = placeholder.placeholderImages;

const users = [
  {
    id: "user_admin",
    email: "admin@stylechange.fr",
    username: "admin",
    name: "Administrateur",
    avatarUrl: ph[6]?.imageUrl,
    location: "Bujumbura Mairie, Mukaza",
    rating: null,
    reviewsCount: 0,
    role: "ADMIN",
    password: "$2b$12$O02CB7GuJDGDodHgX.RzsuP4e2ImLzNYHY7Hq8iKSDKLY5H4jgJb.",
  },
  {
    id: "user_alex",
    email: "alexandre@example.com",
    username: "alex_vintz",
    name: "Alexandre D.",
    avatarUrl: ph[6]?.imageUrl,
    location: "Gitega, Gitega, Centre",
    rating: null,
    reviewsCount: 0,
    role: "USER",
    password: "$2b$12$ShfjrK9.I.ZEH14NERa7MelUF8G96/MGAqAWKYR.EYEH1X6.2Hl7K",
  },
  {
    id: "user_marie",
    email: "marie.vintage@example.com",
    username: "marie_vintage",
    name: "Marie Vintage",
    avatarUrl: ph[6]?.imageUrl,
    location: "Bujumbura Mairie, Ntahangwa, Kamenge",
    rating: 4.8,
    reviewsCount: 124,
    role: "USER",
    password: "$2b$12$VfFiS6nNCyTXk8taNYHk.u2z5Fx2jV42xO6tk2IMecGwxGrP0mfWK",
  },
  {
    id: "user_lucas",
    email: "lucas.style@example.com",
    username: "lucas_style",
    name: "Lucas Style",
    avatarUrl: ph[7]?.imageUrl,
    location: "Ngozi, Ngozi, Centre",
    rating: 4.6,
    reviewsCount: 98,
    role: "USER",
    password: "$2b$12$Wz07c9yJXz8O6GxCfwsg9eA.ZKW..v5IonzbL5XT1uj3yT0bEQQy2",
  },
  {
    id: "user_sophie",
    email: "sophie.mode@example.com",
    username: "sophie_mode",
    name: "Sophie Mode",
    avatarUrl: ph[6]?.imageUrl,
    location: "Kayanza, Kayanza, Centre",
    rating: 4.7,
    reviewsCount: 210,
    role: "USER",
    password: "$2b$12$B.9NK6lZ8PAJn79sNYUU/.CKVcizTurxGoEe14gHSN9KCifWcEPni",
  },
];

const products = [
  {
    id: "1",
    ownerId: "user_marie",
    title: "Veste en jean vintage Levi's 501",
    price: "45.00",
    size: "M",
    brand: "Levi's",
    condition: "Très bon état",
    color: "Bleu délavé",
    location: "Bujumbura Mairie, Ntahangwa",
    description:
      "Authentique veste Levi's des années 90. Très bien entretenue, denim épais de qualité supérieure. Coupe légèrement oversize parfaite pour un look vintage.",
    imageUrl: ph[0]?.imageUrl,
    imageUrls: [ph[0]?.imageUrl, ph[1]?.imageUrl, ph[4]?.imageUrl].filter(Boolean),
  },
  {
    id: "2",
    ownerId: "user_lucas",
    title: "Bottines en cuir noir Dr. Martens",
    price: "110.00",
    size: "39",
    brand: "Dr. Martens",
    condition: "Bon état",
    color: "Noir",
    location: "Ngozi, Ngozi",
    description: null,
    imageUrl: ph[1]?.imageUrl,
    imageUrls: [ph[1]?.imageUrl].filter(Boolean),
  },
  {
    id: "3",
    ownerId: "user_sophie",
    title: "Robe d'été fleurie en soie",
    price: "29.50",
    size: "S",
    brand: "Zara",
    condition: "Très bon état",
    color: "Multicolore",
    location: "Kayanza, Kayanza",
    description: null,
    imageUrl: ph[2]?.imageUrl,
    imageUrls: [ph[2]?.imageUrl].filter(Boolean),
  },
  {
    id: "4",
    ownerId: "user_marie",
    title: "Trench-coat classique Burberry",
    price: "450.00",
    size: "L",
    brand: "Burberry",
    condition: "Satisfaisant",
    color: "Beige",
    location: "Bujumbura Mairie, Mukaza",
    description: null,
    imageUrl: ph[3]?.imageUrl,
    imageUrls: [ph[3]?.imageUrl].filter(Boolean),
  },
  {
    id: "5",
    ownerId: "user_marie",
    title: "Pull en laine tricoté main",
    price: "35.00",
    size: "TU",
    brand: "Fait main",
    condition: "Bon état",
    color: null,
    location: "Bujumbura Mairie, Ntahangwa",
    description: null,
    imageUrl: ph[4]?.imageUrl,
    imageUrls: [ph[4]?.imageUrl].filter(Boolean),
  },
  {
    id: "6",
    ownerId: "user_lucas",
    title: "Sneakers Nike Air Force 1",
    price: "75.00",
    size: "42",
    brand: "Nike",
    condition: "Très bon état",
    color: null,
    location: "Ngozi, Ngozi",
    description: null,
    imageUrl: ph[5]?.imageUrl,
    imageUrls: [ph[5]?.imageUrl].filter(Boolean),
  },
  {
    id: "7",
    ownerId: "user_sophie",
    title: "Chemise en lin beige",
    price: "15.00",
    size: "S",
    brand: "Mango",
    condition: "Bon état",
    color: "Beige",
    location: "Kayanza, Kayanza",
    description: null,
    imageUrl: ph[0]?.imageUrl,
    imageUrls: [ph[0]?.imageUrl].filter(Boolean),
  },
  {
    id: "8",
    ownerId: "user_lucas",
    title: "Sac à main vintage",
    price: "60.00",
    size: "M",
    brand: "Inconnu",
    condition: "Bon état",
    color: null,
    location: "Gitega, Gitega",
    description: null,
    imageUrl: ph[1]?.imageUrl,
    imageUrls: [ph[1]?.imageUrl].filter(Boolean),
  },
];

const threads = [
  {
    id: "thread_1",
    buyerId: "user_alex",
    sellerId: "user_marie",
    productId: "1",
    isOnline: true,
  },
  {
    id: "thread_2",
    buyerId: "user_alex",
    sellerId: "user_lucas",
    productId: "2",
    isOnline: false,
  },
  {
    id: "thread_3",
    buyerId: "user_alex",
    sellerId: "user_sophie",
    productId: "3",
    isOnline: true,
  },
];

const messagesByMock = [
  { senderRole: "me", text: "Bonjour, je suis intéressé par votre veste." },
  { senderRole: "them", text: "Bonjour ! Super, elle est encore disponible." },
  { senderRole: "me", text: "Est-ce que le prix est négociable ?" },
];

async function main() {
  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {
        username: u.username,
        name: u.name,
        avatarUrl: u.avatarUrl,
        location: u.location,
        rating: u.rating,
        reviewsCount: u.reviewsCount,
        role: u.role,
        password: u.password,
      },
      create: {
        id: u.id,
        email: u.email,
        username: u.username,
        name: u.name,
        avatarUrl: u.avatarUrl,
        location: u.location,
        rating: u.rating,
        reviewsCount: u.reviewsCount,
        role: u.role,
        password: u.password,
      },
    });
  }

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: {
        ownerId: p.ownerId,
        title: p.title,
        description: p.description,
        brand: p.brand,
        size: p.size,
        price: p.price,
        category: null,
        condition: p.condition,
        color: p.color,
        location: p.location,
        imageUrl: p.imageUrl,
        imageUrls: p.imageUrls,
      },
      create: {
        id: p.id,
        ownerId: p.ownerId,
        title: p.title,
        description: p.description,
        brand: p.brand,
        size: p.size,
        price: p.price,
        category: null,
        condition: p.condition,
        color: p.color,
        location: p.location,
        imageUrl: p.imageUrl,
        imageUrls: p.imageUrls,
      },
    });
  }

  for (const t of threads) {
    await prisma.messageThread.upsert({
      where: { id: t.id },
      update: {
        buyerId: t.buyerId,
        sellerId: t.sellerId,
        productId: t.productId ?? null,
        isOnline: t.isOnline,
      },
      create: {
        id: t.id,
        buyerId: t.buyerId,
        sellerId: t.sellerId,
        productId: t.productId ?? null,
        isOnline: t.isOnline,
      },
    });

    const existingCount = await prisma.message.count({
      where: { threadId: t.id },
    });

    if (existingCount === 0) {
      for (let i = 0; i < messagesByMock.length; i++) {
        const m = messagesByMock[i];
        const senderId = m.senderRole === "me" ? t.buyerId : t.sellerId;
        await prisma.message.create({
          data: {
            threadId: t.id,
            senderId,
            text: m.text,
            createdAt: new Date(Date.now() - (messagesByMock.length - i) * 60 * 1000),
          },
        });
      }
    }
  }

  console.log("Seed terminé ✅");
}

main()
  .catch((e) => {
    console.error("Seed erreur ❌", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });

