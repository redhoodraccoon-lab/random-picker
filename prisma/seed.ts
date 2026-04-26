import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "admin@admin.com" } });
  if (existing) {
    console.log("Seed already ran – admin@admin.com exists.");
    return;
  }

  const hashed = await bcrypt.hash("123", 12);
  await prisma.user.create({
    data: { email: "admin@admin.com", password: hashed },
  });
  console.log("Seeded admin@admin.com / 123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
