import {
  Po,
  PoProduct,
  Product,
  ReceiveProduct,
  Supplier,
  Warehouse,
} from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await ReceiveProduct.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `RI-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const perPage = req.query.perPage
        ? parseInt(req.query.perPage as string)
        : 20;
      const offset = (page - 1) * perPage;

      const { count, rows: projects } = await ReceiveProduct.findAndCountAll({
        offset,
        where: { companyId },
        include: [
          {
            model: Po,
            as: 'po',
            attributes: [
              'id',
              'no',
              'totalAmount',
              'netAmount',
              'warehouseMode',
              'zoneId',
              'categoryId',
            ],
            include: [
              {
                model: Supplier,
                as: 'supplier',
                attributes: ['id', 'name'],
              },
              {
                model: PoProduct,
                as: 'poProducts',
                include: [
                  {
                    model: Product,
                    as: 'product',
                    attributes: ['name', 'unit', 'priceBuy'],
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
  } else if (req.method === 'POST') {
    try {
      delete req.body.id;
      delete req.body.createdAt;
      delete req.body.updatedAt;
      const { poId, zoneId, companyId } = req.body;

      const productNumber = await generateNumber();
      req.body.no = productNumber;

      const data = (await ReceiveProduct.create(req.body)) as any;
      await Po.update(
        { status: 'complete', receiveId: data?.id },
        { where: { id: req.body.poId } }
      );

      const po = (await Po.findOne({ where: { id: poId } })) as any;
      const poProducts = (await PoProduct.findAll({ where: { poId } })) as any;

      if (poProducts && poProducts?.length !== 0) {
        await Promise.all(
          poProducts?.map(async (item: any) => {
            const checkExistWarehouse = (await Warehouse.findOne({
              where: {
                productId: item?.productId,
                no: item?.no,
                price: item?.price,
              },
            })) as any;

            if (po?.warehouseMode == 'all') {
              if (!checkExistWarehouse) {
                await Warehouse.create({
                  no: item?.no,
                  productId: item?.productId,
                  stock: item?.qty,
                  zoneId: po?.zoneId,
                  price: item?.price,
                  categoryId: po?.categoryId,
                  isCanFix: item?.isCanFix,
                  isCanSell: item?.isCanSell,
                  companyId,
                });
              } else {
                await Warehouse.update(
                  {
                    stock: checkExistWarehouse.stock + item.qty,
                  },
                  {
                    where: {
                      productId: item?.productId,
                      no: item?.no,
                      price: item?.price,
                    },
                  }
                );
              }
            } else if (po?.warehouseMode == 'separate') {
              if (!checkExistWarehouse) {
                await Warehouse.create({
                  no: item?.no,
                  productId: item?.productId,
                  stock: item?.qty,
                  zoneId: item?.zoneId,
                  categoryId: item?.categoryId,
                  isCanFix: item?.isCanFix,
                  isCanSell: item?.isCanSell,
                  companyId,
                });
              } else {
                await Warehouse.update(
                  {
                    stock: checkExistWarehouse.stock + item.qty,
                  },
                  {
                    where: { productId: item?.productId, zoneId, no: item?.no },
                  }
                );
              }
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
