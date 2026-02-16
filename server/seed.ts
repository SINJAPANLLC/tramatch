import { db } from "./db";
import { cargoListings, truckListings, users } from "@shared/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export async function seedDatabase() {
  const existingUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  if (Number(existingUsers[0].count) === 0) {
    const adminPassword = await bcrypt.hash("admin123", 10);
    await db.insert(users).values({
      username: "admin",
      password: adminPassword,
      companyName: "トラマッチ運営",
      phone: "03-0000-0000",
      email: "admin@tramatch.jp",
      userType: "admin",
      role: "admin",
      approved: true,
    });
    console.log("Admin user created (username: admin, password: admin123)");
  }

  const existingCargo = await db.select({ count: sql<number>`count(*)` }).from(cargoListings);
  const existingTrucks = await db.select({ count: sql<number>`count(*)` }).from(truckListings);

  if (Number(existingCargo[0].count) > 0 || Number(existingTrucks[0].count) > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  await db.insert(cargoListings).values([
    {
      title: "東京→大阪 食品冷蔵便",
      departureArea: "東京",
      arrivalArea: "大阪",
      cargoType: "食品（冷蔵）",
      weight: "8t",
      desiredDate: "2026/03/05",
      arrivalDate: "2026/03/06",
      vehicleType: "10t車",
      price: "120,000円",
      description: "冷蔵食品の輸送です。温度管理が必要です。パレット積み20枚。集荷は朝8時希望。",
      companyName: "東京フーズ株式会社",
      contactPhone: "03-1234-5678",
      contactEmail: "logistics@tokyofoods.co.jp",
    },
    {
      title: "名古屋→福岡 機械部品",
      departureArea: "愛知",
      arrivalArea: "福岡",
      cargoType: "機械部品",
      weight: "5t",
      desiredDate: "2026/03/08",
      arrivalDate: "2026/03/09",
      vehicleType: "10t車",
      price: "95,000円",
      description: "精密機械部品のため丁寧な扱いをお願いします。梱包済み。荷降ろし時にフォークリフト使用可能。",
      companyName: "中部メカニクス株式会社",
      contactPhone: "052-987-6543",
      contactEmail: "shipping@chubu-mech.co.jp",
    },
    {
      title: "大阪→東京 アパレル商品",
      departureArea: "大阪",
      arrivalArea: "東京",
      cargoType: "アパレル",
      weight: "3t",
      desiredDate: "2026/03/10",
      arrivalDate: "2026/03/11",
      vehicleType: "4t車",
      price: "65,000円",
      description: "春物アパレル商品。ハンガーラック使用。雨濡れ厳禁。",
      companyName: "関西アパレル株式会社",
      contactPhone: "06-5555-1234",
      contactEmail: "info@kansai-apparel.co.jp",
    },
    {
      title: "北海道→東京 農産物",
      departureArea: "北海道",
      arrivalArea: "東京",
      cargoType: "農産物",
      weight: "10t",
      desiredDate: "2026/03/12",
      arrivalDate: "2026/03/14",
      vehicleType: "大型車",
      price: "180,000円",
      description: "じゃがいも・玉ねぎの大量輸送。バラ積み。鮮度管理のため迅速な配送をお願いします。",
      companyName: "北海道農産直送株式会社",
      contactPhone: "011-222-3333",
      contactEmail: "nouhan@hokkaido-farm.co.jp",
    },
    {
      title: "埼玉→仙台 建材",
      departureArea: "埼玉",
      arrivalArea: "宮城",
      cargoType: "建材",
      weight: "7t",
      desiredDate: "2026/03/15",
      arrivalDate: "2026/03/16",
      vehicleType: "10t車",
      description: "木材・合板の輸送。長尺物あり（最大4m）。荷台シート掛け必要。",
      companyName: "関東建材株式会社",
      contactPhone: "048-777-8888",
      contactEmail: "haiso@kanto-kenzai.co.jp",
    },
  ]);

  await db.insert(truckListings).values([
    {
      title: "10t車 関東→関西 空車あり",
      currentArea: "東京",
      destinationArea: "大阪",
      vehicleType: "10t車",
      maxWeight: "10t",
      availableDate: "2026/03/06",
      price: "100,000円",
      description: "ウイング車。パレット対応可能。翌日着可。高速道路利用。",
      companyName: "首都圏運送株式会社",
      contactPhone: "03-9876-5432",
      contactEmail: "dispatch@shutoken-unsou.co.jp",
    },
    {
      title: "4t車 大阪→名古屋 空車",
      currentArea: "大阪",
      destinationArea: "愛知",
      vehicleType: "4t車",
      maxWeight: "4t",
      availableDate: "2026/03/07",
      price: "45,000円",
      description: "箱車。冷蔵機能なし。午前中出発可能。ドライバー1名。",
      companyName: "大阪ロジスティクス株式会社",
      contactPhone: "06-1111-2222",
      contactEmail: "info@osaka-logistics.co.jp",
    },
    {
      title: "大型トレーラー 九州→関東",
      currentArea: "福岡",
      destinationArea: "東京",
      vehicleType: "トレーラー",
      maxWeight: "20t",
      availableDate: "2026/03/09",
      price: "200,000円",
      description: "海上コンテナ輸送対応。20ftコンテナ可能。福岡港付近から出発。",
      companyName: "九州物流株式会社",
      contactPhone: "092-333-4444",
      contactEmail: "haisha@kyushu-butsuryu.co.jp",
    },
    {
      title: "2t車 東京都内 空車",
      currentArea: "東京",
      destinationArea: "東京",
      vehicleType: "2t車",
      maxWeight: "2t",
      availableDate: "2026/03/05",
      price: "25,000円",
      description: "都内配送専門。狭い道路も対応可能。引越し・小口配送に最適。ゲート車。",
      companyName: "東京デリバリー株式会社",
      contactPhone: "03-5555-6666",
      contactEmail: "delivery@tokyo-delivery.co.jp",
    },
    {
      title: "冷蔵10t車 東北→関東",
      currentArea: "宮城",
      destinationArea: "埼玉",
      vehicleType: "10t車",
      maxWeight: "10t",
      availableDate: "2026/03/11",
      price: "130,000円",
      description: "冷蔵冷凍車。-20度まで対応。食品輸送実績多数。HACCP対応ドライバー。",
      companyName: "東北冷蔵運輸株式会社",
      contactPhone: "022-888-9999",
      contactEmail: "reizo@tohoku-reizo.co.jp",
    },
  ]);

  console.log("Seed data inserted successfully.");
}
