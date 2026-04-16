// api/_lib/prisma.ts
// 彻底移除所有 import 和数据库调用
export const prisma = {
  equipment: {
    findMany: async () => [
      { id: '1', code: 'EQ-2026-001', name: '1多参数监护仪', brand: '迈瑞', model: 'N17', department: 'ICU', status: 'IN_USE', risk: 'HIGH', createdAt: new Date(), updatedAt: new Date() },
      { id: '2', code: 'EQ-2026-002', name: '除颤仪', brand: '飞利浦', model: 'Dfm100', department: '急诊科', status: 'IN_USE', risk: 'HIGH', createdAt: new Date(), updatedAt: new Date() },
      { id: '3', code: 'EQ-2026-003', name: '呼吸机', brand: '德尔格', model: 'Savina', department: '呼吸科', status: 'IN_REPAIR', risk: 'MEDIUM', createdAt: new Date(), updatedAt: new Date() }
    ],
    create: async () => ({ id: Date.now().toString() }),
    update: async () => ({ ok: true }),
    delete: async () => ({ ok: true }),
  },
  user: {
    findUnique: async () => ({ id: 'mock-admin-id', username: 'admin', department: '信息科' }),
  }
} as any;
