import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, CardStatus } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const room101 = await prisma.room.upsert({
    where: { number: "101" },
    update: {},
    create: { number: "101", note: "ตึก A ชั้น 1" },
  });
  const room204 = await prisma.room.upsert({
    where: { number: "204" },
    update: {},
    create: { number: "204", note: "ตึก A ชั้น 2" },
  });

  await prisma.keycard.createMany({
    data: [
      { roomId: room101.id, code: "00011", status: CardStatus.ACTIVE },
      { roomId: room101.id, code: "00012", status: CardStatus.ACTIVE },
      {
        roomId: room204.id,
        code: "00042",
        status: CardStatus.PROCESS_INACTIVE,
      },
      { roomId: room204.id, code: "00099", status: CardStatus.INACTIVE },
    ],
  });

  console.log("Seed data created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
