import { Product, Repair, Warehouse } from '@/database';
import RepairPayment from '@/database/models/repair/payment';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, companyId } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await RepairPayment.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `PAY-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await RepairPayment.findAll();
        res.json(data);
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const { count, rows: projects } = await RepairPayment.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: Repair,
              as: 'repair',
              include: [
                {
                  model: Warehouse,
                  as: 'warehouse',
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name'],
                    },
                  ],
                  attributes: ['no'],
                },
              ],
              attributes: ['cause'],
            },
          ],
          limit: perPage,
        });

        const totalItems = count;
        const allPages = Math.ceil(totalItems / perPage);

        return res.status(200).json({
          data: projects,
          page,
          perPage,
          totalItems,
          allPages,
        });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    }
  } else if (req.method === 'POST') {
    try {
      delete req.body.id;
      delete req.body.createdAt;
      delete req.body.updatedAt;

      const quoNumber = await generateNumber();
      req.body.no = quoNumber;

      const { repairId, fixStatus, warehouseId } = req.body;

      const data = (await RepairPayment.create(req.body)) as any;

      const fixStatusData =
        fixStatus == 'complete'
          ? 'complete'
          : fixStatus == 'notComplete'
            ? 'inComplete'
            : 'inComplete';

      await Repair.update(
        { paymentId: data?.id, status: fixStatusData },
        {
          where: {
            id: repairId,
          },
        }
      );

      if (warehouseId) {
        const statusData =
          fixStatus == 'complete'
            ? 'available'
            : fixStatus == 'notComplete'
              ? 'fixingAgain'
              : 'damaged';
        await Warehouse.update(
          { status: statusData },
          { where: { id: warehouseId } }
        );
      }

      await res.json({ message: 'สร้างข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
