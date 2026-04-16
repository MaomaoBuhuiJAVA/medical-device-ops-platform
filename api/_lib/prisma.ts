// api/_lib/prisma.ts
import { kv } from '@vercel/kv';

// 这是一个模拟 Prisma 接口的 KV 包装器
export const prisma = {
  user: {
    findUnique: async ({ where }: any) => {
      // 模拟一个默认管理员账号：admin / 123456
      const user = await kv.get(`user:${where.username || where.id}`);
      if (user) return user;
      
      if (where.username === 'admin' || where.id === 'mock-admin-id') {
        return {
          id: 'mock-admin-id',
          username: 'admin',
          department: '信息科',
          passwordHash: '$2a$10$kh.8Xn.L854.YvEOnE7mte.YV1UvF.UvF.UvF.UvF.UvF.UvF.UvF.' 
        };
      }
      return null;
    },
    count: async () => 1,
  },
  equipment: {
    findMany: async () => {
      let list = await kv.get<any[]>('equipment_list');
      if (!list) {
        list = [
          { id: '1', code: 'EQ-2026-001', name: '多参数监护仪', brand: '迈瑞', model: 'N17', department: 'ICU', status: 'IN_USE', risk: 'HIGH', createdAt: new Date(), updatedAt: new Date() }
        ];
        await kv.set('equipment_list', list);
      }
      return list;
    },
    create: async ({ data }: any) => {
      const list = (await kv.get<any[]>('equipment_list')) || [];
      const newEquip = { ...data, id: Date.now().toString(), createdAt: new Date(), updatedAt: new Date() };
      list.push(newEquip);
      await kv.set('equipment_list', list);
      return newEquip;
    },
    update: async ({ where, data }: any) => {
      let list = (await kv.get<any[]>('equipment_list')) || [];
      list = list.map(e => e.id === where.id ? { ...e, ...data, updatedAt: new Date() } : e);
      await kv.set('equipment_list', list);
      return { ok: true };
    }
  },
  userRole: {
    findMany: async () => [
      { role: { name: 'admin', permissions: [{ permission: { key: 'equipment:read' } }, { permission: { key: 'equipment:update' } }, { permission: { key: 'equipment:create' } }, { permission: { key: 'admin:manage' } }] } }
    ],
  }
} as any;