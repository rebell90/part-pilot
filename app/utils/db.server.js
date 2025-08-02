import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Prevent creating new instances during hot-reload in dev
  if (!global.__prisma) {
    global.__prisma = new PrismaClient();
  }
  prisma = global.__prisma;
}

// ✅ Named export (so `import { prisma } ...` works)
export { prisma };

// Optionally, also export default for lazy imports in webhooks
export default prisma;