import {
  ServiceTaxInvoice,
  ServiceReceipt,
  Service,
  Customer,
  ProjectGuaranteeSlip,
  ProjectStampSlip,
  Inventory,
  Product,
  Warehouse,
} from '@/database';
import InventoryReturn from '@/database/models/inventory/return';
import InventoryWithdraw from '@/database/models/inventory/withdraw';
import Project from '@/database/models/project';
import WarehouseCategory from '@/database/models/warehouse/category';
import WarehouseZone from '@/database/models/warehouse/zone';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Op, Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { companyId, type, dateStart, dateEnd, databaseSearch, status } =
      req.query as any;

    if (type === 'projects') {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const whereClause: any = { companyId };

        if (status && status !== 'all') {
          whereClause.status = status;
        }

        if (!!databaseSearch) {
          whereClause[Op.or] = [
            { name: { [Op.like]: `%${databaseSearch}%` } },
            { organization: { [Op.like]: `%${databaseSearch}%` } },
            { contractAmount: { [Op.like]: `%${databaseSearch}%` } },
            { contractNo: { [Op.like]: `%${databaseSearch}%` } },
          ];
        }

        if (
          dateStart &&
          dateStart !== 'null' &&
          dateEnd &&
          dateEnd !== 'null'
        ) {
          whereClause.contractDate = {
            [Op.between]: [dateStart, dateEnd],
          };
        }

        let result;
        if (databaseSearch || (dateStart && dateEnd)) {
          result = await Project.findAll({
            where: whereClause,
            include: [
              {
                model: Service,
                as: 'service',
                include: [
                  {
                    model: ServiceTaxInvoice,
                    as: 'taxInvoice',
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'],
                    },
                  },
                  {
                    model: ServiceReceipt,
                    as: 'receipt',
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'],
                    },
                  },
                ],
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
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
                where: { projectId: Sequelize.col('Project.id') },
              },
              {
                model: Customer,
                as: 'customer',
                attributes: [
                  'name',
                  'type',
                  'fullAddress',
                  'taxId',
                  'telephone',
                ],
              },
              {
                model: ProjectGuaranteeSlip,
                as: 'guarantee',
                attributes: ['status'],
              },
              {
                model: ProjectStampSlip,
                as: 'stamp',
                attributes: ['status'],
              },
            ],
            order: [
              [{ model: Inventory, as: 'inventory' }, 'createdAt', 'DESC'],
              ['createdAt', 'DESC'],
            ],
          });
          return res.status(200).json({
            data: result,
            totalItems: result.length,
            page: 1,
            perPage: result.length,
            allPages: 1,
          });
        } else {
          const whereClause: any = { companyId };

          if (status && status !== 'all') {
            whereClause.status = status;
          }

          const { count, rows: projects } = await Project.findAndCountAll({
            offset,
            where: whereClause,
            include: [
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
                where: { projectId: Sequelize.col('Project.id') },
              },
              {
                model: Service,
                as: 'service',
                include: [
                  {
                    model: ServiceTaxInvoice,
                    as: 'taxInvoice',
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'],
                    },
                  },
                  {
                    model: ServiceReceipt,
                    as: 'receipt',
                    attributes: {
                      exclude: ['createdAt', 'updatedAt'],
                    },
                  },
                ],
                attributes: {
                  exclude: ['createdAt', 'updatedAt'],
                },
              },
              {
                model: Customer,
                as: 'customer',
                attributes: [
                  'name',
                  'type',
                  'fullAddress',
                  'taxId',
                  'telephone',
                ],
              },
              {
                model: ProjectGuaranteeSlip,
                as: 'guarantee',
                attributes: ['status'],
              },
              {
                model: ProjectStampSlip,
                as: 'stamp',
                attributes: ['status'],
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
        }
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
    } else if (type === 'dashboard') {
      try {
        const whereClause: any = { companyId };

        if (!!databaseSearch) {
          whereClause[Op.or] = [
            { name: { [Op.like]: `%${databaseSearch}%` } },
            { organization: { [Op.like]: `%${databaseSearch}%` } },
            { contractAmount: { [Op.like]: `%${databaseSearch}%` } },
            { contractNo: { [Op.like]: `%${databaseSearch}%` } },
          ];
        }

        if (
          dateStart &&
          dateStart !== 'null' &&
          dateEnd &&
          dateEnd !== 'null'
        ) {
          whereClause.contractDate = {
            [Op.between]: [dateStart, dateEnd],
          };
        }

        let projects;
        if (databaseSearch || (dateStart && dateEnd)) {
          projects = await Project.findAll({
            where: whereClause,
            attributes: [
              'contractAmount',
              'guaranteeAmount',
              'guaranteeNumber',
            ],
            order: [['createdAt', 'DESC']],
          });
        } else {
          projects = await Project.findAll({
            where: { companyId },
            attributes: [
              'contractAmount',
              'guaranteeAmount',
              'guaranteeNumber',
            ],
          });
        }

        const projectCount = projects.length;
        const totalContractAmount = projects.reduce((sum, project: any) => {
          return sum + (project.contractAmount || 0);
        }, 0);
        const totalGuaranteeAmount = projects.reduce((sum, project: any) => {
          return sum + (project.guaranteeAmount || 0);
        }, 0);
        const guaranteeCount = projects.filter(
          (project: any) => project.guaranteeNumber
        ).length;

        return res.status(200).json({
          projectCount,
          totalContractAmount,
          totalGuaranteeAmount,
          guaranteeCount,
        });
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
    } else {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }
  } else if (req.method === 'POST') {
    try {
      delete req.body.id;
      delete req.body.createdAt;
      delete req.body.updatedAt;

      await Project.create(req.body);

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
