export default async function handler(req: any, res: any) {
  // 不连任何数据库，直接返回死数据
  const data = [
    { id: '1', code: 'EQ-2026-001', name: '多参数监护仪', brand: '迈瑞', model: 'N17', department: 'ICU', status: 'IN_USE', risk: 'HIGH', createdAt: new Date().toISOString() },
    { id: '2', code: 'EQ-2026-002', name: '除颤仪', brand: '飞利浦', model: 'Dfm100', department: '急诊科', status: 'IN_USE', risk: 'HIGH', createdAt: new Date().toISOString() },
    { id: '3', code: 'EQ-2026-003', name: '呼吸机', brand: '德尔格', model: 'Savina', department: '呼吸科', status: 'IN_REPAIR', risk: 'MEDIUM', createdAt: new Date().toISOString() }
  ];
  return res.status(200).json(data)
}
