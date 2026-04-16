import { kv } from '@vercel/kv';

export const prisma = {
  equipment: {
    findMany: async () => {
      let list = await kv.get<any[]>('equipment_list');
      if (!list) {
        list = [
          { id: '1', code: 'EQ-2026-001', name: '多参数监护仪', brand: '迈瑞', model: 'N17', department: 'ICU', status: 'IN_USE', risk: 'HIGH', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', code: 'EQ-2026-002', name: '除颤仪', brand: '飞利浦', model: 'Dfm100', department: '急诊科', status: 'IN_USE', risk: 'HIGH', createdAt: new Date(), updatedAt: new Date() }
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
  }
} as any;
