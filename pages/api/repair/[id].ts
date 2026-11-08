import { Warehouse } from '@/database';
import Repair from '@/database/models/repair';
import RepairPayment from '@/database/models/repair/payment';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Repair.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

      await Repair.update(newValues, { where: { id } });
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'DELETE') {
    try {
      const repair = (await Repair.findOne({
        where: { id },
        attributes: ['warehouseId'],
      })) as any;

      const payment = (await RepairPayment.findOne({
        where: { repairId: id },
        attributes: ['id'],
      })) as any;

      if (payment) {
        await RepairPayment.destroy({ where: { id: payment?.id } });
      }

      if (repair) {
        await Warehouse.update(
          { status: 'available' },
          {
            where: {
              id: repair?.warehouseId,
            },
          }
        );
      }

      await Repair.destroy({ where: { id } });

      res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
