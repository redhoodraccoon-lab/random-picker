import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashed = await bcrypt.hash("XeCo@1990!", 12);
  await prisma.user.upsert({
    where: { email: "g.khetsoidze@gmail.com" },
    update: { role: "ADMIN" },
    create: { email: "g.khetsoidze@gmail.com", password: hashed, role: "ADMIN" },
  });
  console.log("Seeded master admin: g.khetsoidze@gmail.com");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
