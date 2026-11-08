import {
  CompanyBank,
  Customer,
  DeliveryNote,
  Product,
  Quo,
  Receipt,
  TaxInvoice,
  Warehouse,
} from '@/database';
import QuoProduct from '@/database/models/account/quo/product';
import Company from '@/database/models/company';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, companyId, no } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await Quo.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `QUO-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await Quo.findAll({
          where: { companyId },
          attributes: ['id', 'no'],
        });
        res.json(data);
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else if (type == 'pdf') {
      try {
        const data = await Quo.findOne({
          include: [
            {
              model: Company,
              as: 'company',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
            {
              model: DeliveryNote,
              as: 'deliveryNote',
              attributes: ['status', 'no'],
            },
            {
              model: TaxInvoice,
              as: 'taxInvoice',
              attributes: ['status', 'no'],
            },
            {
              model: Receipt,
              as: 'receipt',
              attributes: ['status', 'no'],
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [
                'id',
                'name',
                'fullAddress',
                'taxId',
                'telephone',
                'type',
              ],
            },
            {
              model: CompanyBank,
              as: 'toCompany',
              attributes: ['fullBank'],
            },
            {
              model: QuoProduct,
              as: 'poProducts',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['no', 'name', 'unit', 'priceBuy'],
                },
              ],
              where: {
                quoId: Sequelize.col('Quo.id'),
              },
              required: false,
            },
          ],
          where: { no },
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

        const { count, rows: projects } = await Quo.findAndCountAll({
          offset,
          include: [
            {
              model: Company,
              as: 'company',
              attributes: {
                exclude: ['createdAt', 'updatedAt'],
              },
            },
            {
              model: DeliveryNote,
              as: 'deliveryNote',
              attributes: ['status', 'no'],
            },
            {
              model: TaxInvoice,
              as: 'taxInvoice',
              attributes: ['status', 'no'],
            },
            {
              model: Receipt,
              as: 'receipt',
              attributes: ['status', 'no'],
            },
            {
              model: Customer,
              as: 'customer',
              attributes: [
                'id',
                'name',
                'fullAddress',
                'taxId',
                'telephone',
                'type',
              ],
            },
            {
              model: CompanyBank,
              as: 'toCompany',
              attributes: ['fullBank'],
            },
            {
              model: QuoProduct,
              as: 'poProducts',
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['name', 'unit', 'priceBuy'],
                },
              ],
              where: {
                quoId: Sequelize.col('Quo.id'),
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

      const quoNumber = await generateNumber();
      req.body.no = quoNumber;

      const afterCreate = (await Quo.create(req.body)) as any;
      const quoId = afterCreate?.id;
      const products = req.body.products;

      if (products && products.length !== 0) {
        await Promise.all(
          products.map(async (item: any) => {
            await QuoProduct.create({ ...item, quoId });

            const warehouseItem = (await Warehouse.findOne({
              where: { productId: item.productId, no: item.no },
            })) as any;

            if (warehouseItem) {
              const newStock = warehouseItem.stock - item.qty;

              await Warehouse.update(
                { stock: newStock },
                { where: { productId: item.productId, no: item.no } }
              );
            }
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
