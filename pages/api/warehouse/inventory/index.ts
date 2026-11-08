import { Inventory, Product, Project, Repair, Warehouse } from '@/database';
import InventoryReturn from '@/database/models/inventory/return';
import InventoryWithdraw from '@/database/models/inventory/withdraw';
import WarehouseCategory from '@/database/models/warehouse/category';
import WarehouseZone from '@/database/models/warehouse/zone';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await Inventory.findAll({
          where: { companyId },
          attributes: ['name', 'id'],
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

        const { count, rows: projects } = await Inventory.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: Repair,
              as: 'repair',
              attributes: ['cause', 'id'],
              include: [
                {
                  model: Warehouse,
                  as: 'warehouse',
                  attributes: ['id', 'no'],
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name'],
                    },
                  ],
                },
              ],
            },
            {
              model: Project,
              as: 'project',
              attributes: ['name'],
            },
            {
              model: InventoryWithdraw,
              as: 'inventoryWithdraw',
              attributes: ['qty', 'warehouseId'],
              include: [
                {
                  model: Warehouse,
                  as: 'warehouse',
                  attributes: ['no', 'price', 'productId'],
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name', 'unit'],
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
                },
              ],
              where: {
                inventoryId: Sequelize.col('Inventory.id'),
              },
              required: false,
            },
            {
              model: InventoryReturn,
              as: 'inventoryReturn',
              attributes: ['qty'],
              include: [
                {
                  model: Warehouse,
                  as: 'warehouse',
                  attributes: ['no', 'price'],
                  include: [
                    {
                      model: Product,
                      as: 'product',
                      attributes: ['name', 'unit'],
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
                },
              ],
              where: {
                inventoryId: Sequelize.col('Inventory.id'),
              },
              required: false,
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

      const data = (await Inventory.create(req.body)) as any;
      const products = req.body.products;

      if (products && products.length !== 0) {
        await Promise.all(
          products.map(async (item: any) => {
            await InventoryWithdraw.create({ ...item, inventoryId: data?.id });

            const warehouseItem = (await Warehouse.findOne({
              where: {
                productId: item.productId,
                no: item.no,
              },
            })) as any;

            if (warehouseItem) {
              const newStock = warehouseItem.stock - item.qty;

              if (newStock == 0) {
                if (req?.body?.modeWithdraw == 'return') {
                  await Warehouse.update(
                    { stock: newStock, status: 'onHold' },
                    { where: { productId: item.productId, no: item.no } }
                  );
                } else {
                  await Warehouse.update(
                    { stock: newStock, status: 'outOfStock' },
                    { where: { productId: item.productId, no: item.no } }
                  );
                }
              } else {
                await Warehouse.update(
                  { stock: newStock },
                  { where: { productId: item.productId, no: item.no } }
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
