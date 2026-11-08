import { Customer, DeliveryNote, Product, Quo, QuoProduct } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await DeliveryNote.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `DLN-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await DeliveryNote.findAll({
          where: {
            companyId,
          },
        });
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

        const { count, rows: projects } = await DeliveryNote.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: Quo,
              as: 'Quo',
              include: [
                {
                  model: Customer,
                  as: 'customer',
                  attributes: ['name'],
                },
                {
                  model: QuoProduct,
                  as: 'poProducts',
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name', 'unit'],
                    },
                  ],
                },
              ],
            },
          ],
          limit: perPage,
          order: [['createdAt', 'DESC']],
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

      const data = (await DeliveryNote.create(req.body)) as any;
      await Quo.update(
        { deliveryNoteId: data?.id },
        { where: { id: req.body.quoId } }
      );

      res.json({ message: 'สร้างข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
