declare global {
  var prisma: undefined | ReturnType<typeof getPrismaClient>;
}

import { PrismaClient as ImportedPrismaClient } from '.prisma/client';

export type PrismaClient = ImportedPrismaClient;

function getPrismaClient() {
  const client = new ImportedPrismaClient();
  return client;
}

export const prisma = globalThis.prisma ?? getPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}