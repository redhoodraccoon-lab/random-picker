import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: "g.khetsoidze@gmail.com" } });
  if (existing) {
    console.log("Seed already ran – g.khetsoidze@gmail.com exists.");
    return;
  }

  const hashed = await bcrypt.hash("XeCo@1990!", 12);
  await prisma.user.create({
    data: { email: "g.khetsoidze@gmail.com", password: hashed },
  });
  console.log("Seeded g.khetsoidze@gmail.com / XeCo@1990!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
