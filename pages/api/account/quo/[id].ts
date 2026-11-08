import { Product, Quo, QuoProduct, Warehouse } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Quo.findOne({
        where: { id },
        include: [
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
            attributes: { exclude: ['updatedAt', 'createdAt'] },
            where: {
              quoId: Sequelize.col('Quo.id'),
            },
            required: false,
          },
        ],
      });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    const { type, amount } = req.query;

    if (type == 'updateAmount') {
      await Quo.update(
        { totalAmount: amount, netAmount: amount },
        { where: { id } }
      );
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } else {
      try {
        const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

        await Quo.update(newValues, { where: { id } });

        if (req?.body?.status == 'notInterested') {
          const products = req.body.products;

          if (products && products.length !== 0) {
            await Promise.all(
              products.map(async (item: any) => {
                const warehouseItem = (await Warehouse.findOne({
                  where: { productId: item.productId, no: item.no },
                })) as any;

                if (warehouseItem) {
                  const newStock = warehouseItem.stock + item.qty;

                  await Warehouse.update(
                    { stock: newStock },
                    { where: { productId: item.productId, no: item.no } }
                  );
                }
              })
            );
          }
        }

        res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
      return;
    }
  } else if (req.method === 'DELETE') {
    try {
      await Quo.destroy({ where: { id } });

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
