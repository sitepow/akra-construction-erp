import {
  CompanyBank,
  Po,
  PoProduct,
  Product,
  ReceiveProduct,
  Supplier,
  SupplierBank,
} from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, companyId } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await Po.findAll({
          where: { companyId },
          attributes: ['id', 'no'],
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

        const { count, rows: projects } = await Po.findAndCountAll({
          offset,
          include: [
            {
              model: ReceiveProduct,
              as: 'receiveProduct',
              attributes: ['status', 'createdAt'],
            },
            {
              model: Supplier,
              as: 'supplier',
              attributes: ['name'],
            },
            {
              model: SupplierBank,
              as: 'toSupplier',
              attributes: ['fullBank'],
            },
            {
              model: CompanyBank,
              as: 'fromCompany',
              attributes: ['fullBank'],
            },
            {
              model: PoProduct,
              as: 'poProducts',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['name', 'unit'],
                },
              ],
              where: {
                poId: Sequelize.col('Po.id'),
              },
              required: false,
            },
          ],
          where: { companyId },
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

      const afterCreate = (await Po.create(req.body)) as any;
      const poId = afterCreate?.id;
      const products = req.body.products;

      if (products && products?.length !== 0) {
        await Promise.all(
          await products?.map(async (item: any, index: any) => {
            await PoProduct.create({ ...item, poId });
          })
        );
      }

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
