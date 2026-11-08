import { Po, PoProduct, Product, ReceiveProduct } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Po.findOne({
        where: { id },
        include: [
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
            attributes: { exclude: ['updatedAt', 'createdAt'] },
            where: {
              poId: Sequelize.col('Po.id'),
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
      await Po.update(
        { totalAmount: amount, netAmount: amount },
        { where: { id } }
      );
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } else {
      try {
        const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

        await Po.update(newValues, { where: { id } });

        const poProducts = req.body.products;

        if (poProducts && poProducts.length !== 0) {
          await Promise.all(
            poProducts.map(async (item: any) => {
              if (item.isUpdate && item?.id) {
                await PoProduct.update(item, { where: { id: item.id } });
              } else {
                await PoProduct.create({ ...item, poId: id });
              }
            })
          );
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
      await ReceiveProduct.destroy({ where: { poId: id } });
      await Po.destroy({ where: { id } });

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
