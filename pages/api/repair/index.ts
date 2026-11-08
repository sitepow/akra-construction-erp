import { Inventory, Product, Repair, Warehouse } from '@/database';
import InventoryReturn from '@/database/models/inventory/return';
import InventoryWithdraw from '@/database/models/inventory/withdraw';
import RepairPayment from '@/database/models/repair/payment';
import WarehouseCategory from '@/database/models/warehouse/category';
import WarehouseZone from '@/database/models/warehouse/zone';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type, isChangePart } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await RepairPayment.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `FIX-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const whereClause: any = { companyId };

        if (isChangePart) {
          whereClause.isChangePart = isChangePart === 'true';
        }

        const data = await Repair.findAll({
          where: whereClause,
          include: [
            {
              model: Warehouse,
              as: 'warehouse',
              attributes: ['no'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['name'],
                },
              ],
            },
          ],
        });

        const newFormat = data?.map((item: any) => {
          const plainItem = item.get({ plain: true });
          return {
            ...plainItem,
            fullRepairName: `${plainItem?.warehouse?.product?.name} (รหัสสินค้า ${plainItem?.warehouse?.no}) (ปัญหาที่เกิด ${plainItem?.cause})`,
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

        const { count, rows: projects } = await Repair.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: RepairPayment,
              as: 'payment',
              attributes: ['status'],
            },
            {
              model: Warehouse,
              as: 'warehouse',
              attributes: ['no'],
              include: [
                { model: Product, as: 'product', attributes: ['name'] },
              ],
            },
            {
              model: Inventory,
              as: 'inventory',
              required: false,
              attributes: ['id', 'createdAt', 'explain', 'modeWithdraw'],
              include: [
                {
                  model: InventoryWithdraw,
                  as: 'withdraw',
                  attributes: ['qty', 'createdAt', 'warehouseId'],
                  required: false,
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
                          model: WarehouseCategory,
                          as: 'warehouseCategory',
                          attributes: ['name'],
                        },
                        {
                          model: WarehouseZone,
                          as: 'zone',
                          attributes: ['name'],
                        },
                      ],
                    },
                  ],
                  where: {
                    'InventoryWithdraw.inventoryId':
                      Sequelize.col('inventory.id'),
                  },
                },
                {
                  model: InventoryReturn,
                  as: 'return',
                  attributes: ['qty', 'createdAt', 'warehouseId'],
                  required: false,
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
                          model: WarehouseCategory,
                          as: 'warehouseCategory',
                          attributes: ['name'],
                        },
                        {
                          model: WarehouseZone,
                          as: 'zone',
                          attributes: ['name'],
                        },
                      ],
                    },
                  ],
                  where: {
                    'InventoryReturn.inventoryId':
                      Sequelize.col('inventory.id'),
                  },
                },
              ],
              where: { repairId: Sequelize.col('Repair.id') },
            },
          ],
          limit: perPage,
          order: [
            [{ model: Inventory, as: 'inventory' }, 'createdAt', 'DESC'],
            ['createdAt', 'DESC'],
          ],
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

      await Repair.create(req.body);
      await Warehouse.update(
        { status: 'fixing' },
        { where: { id: req?.body?.warehouseId } }
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
