import { PrismaClient } from '@prisma/client';
let prisma = null;
export function getPrisma() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['warn', 'error'],
        });
    }
    return prisma;
}
export async function closePrisma() {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
}
//# sourceMappingURL=db.js.map