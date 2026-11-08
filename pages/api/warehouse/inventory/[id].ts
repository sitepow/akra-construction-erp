import { Warehouse } from '@/database';
import Inventory from '@/database/models/inventory';
import InventoryReturn from '@/database/models/inventory/return';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Inventory.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

      await Inventory.update(newValues, { where: { id } });
      const products = req.body.returnProducts;

      if (products && products.length !== 0) {
        await Promise.all(
          products.map(async (item: any) => {
            await InventoryReturn.create({ ...item, inventoryId: id });

            const warehouseItem = (await Warehouse.findOne({
              where: { productId: item.productId, no: item.no },
            })) as any;

            if (warehouseItem) {
              const newStock = warehouseItem.stock + parseFloat(item.qty);

              await Warehouse.update(
                { stock: newStock, status: 'available' },
                { where: { productId: item.productId, no: item.no } }
              );
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
  } else if (req.method === 'DELETE') {
    try {
      await Inventory.destroy({ where: { id } });

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
