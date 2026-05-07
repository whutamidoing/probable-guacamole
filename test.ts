import prisma from "@/lib/prisma";

async function main() {
  const val = await prisma.user.findMany({
    take: 10,
  });
  console.log(val);
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
