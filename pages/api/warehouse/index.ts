import { Product, ProductCategory, Warehouse } from '@/database';
import WarehouseCategory from '@/database/models/warehouse/category';
import WarehouseZone from '@/database/models/warehouse/zone';
import { protect } from '@/middlewares/protect';
import { formatAmount } from '@/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type, categoryId, isCanFix, status, isCanSell } =
    req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const whereClause: any = {
          companyId,
          stock: {
            [Op.gt]: 0,
          },
        };

        if (categoryId && categoryId !== 'all') {
          whereClause.categoryId = categoryId;
        }

        if (status) {
          whereClause.status = status;
        }

        if (isCanFix === 'true') {
          whereClause.isCanFix = 'fix';
        } else if (isCanFix === 'false') {
          whereClause.isCanFix = 'not_fix';
        }

        if (isCanSell === 'true') {
          whereClause.isCanSell = 'sell';
        } else if (isCanSell === 'false') {
          whereClause.isCanSell = 'not_sell';
        }

        const data = await Warehouse.findAll({
          attributes: ['id', 'no', 'productId', 'stock'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'priceSell', 'priceBuy', 'unit'],
            },
          ],
          where: whereClause,
        });

        const newFormat = data?.map((item: any) => {
          const plainItem = item.get({ plain: true });
          return {
            ...plainItem,
            fullProductName: `${plainItem?.product?.name} (รหัสสินค้า ${plainItem?.no}) (คงเหลือ ${formatAmount(plainItem?.stock)} ${plainItem?.product?.unit})`,
          };
        });
        return res.json(newFormat);
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

        const whereClause: any = { companyId };
        if (categoryId && categoryId !== 'all') {
          whereClause.categoryId = categoryId;
        }

        const { count, rows: projects } = await Warehouse.findAndCountAll({
          offset,
          where: whereClause,
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'priceSell', 'priceBuy', 'unit'],
              include: [
                {
                  model: ProductCategory,
                  as: 'category',
                  attributes: ['name'],
                },
              ],
            },
            {
              model: WarehouseZone,
              as: 'zone',
              attributes: ['name'],
            },
            {
              model: WarehouseCategory,
              as: 'warehouseCategory',
              attributes: ['name'],
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

      await Warehouse.create(req.body);

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
