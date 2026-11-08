import {
  CompanyBank,
  Customer,
  Project,
  Service,
  ServiceReceipt,
  ServiceTaxInvoice,
} from '@/database';
import Company from '@/database/models/company';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, serviceId, type } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const count = await Service.count();

    if (count >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = count + 1;

    const countNumber = `SER-${nextNumber.toString().padStart(8, '0')}`;

    return countNumber;
  };

  if (req.method === 'GET') {
    if (type == 'pdf') {
      try {
        const data = await Service.findOne({
          include: [
            {
              model: CompanyBank,
              as: 'toBank',
              attributes: ['fullBank'],
            },
            {
              model: Company,
              as: 'company',
              attributes: ['name', 'fullAddress', 'tax', 'telephone', 'fax'],
            },
            {
              model: ServiceTaxInvoice,
              as: 'taxInvoice',
              attributes: ['status', 'no', 'pendingDate'],
            },
            {
              model: ServiceReceipt,
              as: 'receipt',
              attributes: ['status', 'no', 'pendingDate'],
            },
            {
              model: Project,
              as: 'project',
              include: [
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
              ],
              attributes: ['name', 'status', 'contractDate', 'contractAmount'],
            },
          ],
          where: { id: serviceId },
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

        const { count, rows: projects } = await Service.findAndCountAll({
          offset,
          include: [
            {
              model: CompanyBank,
              as: 'toBank',
              attributes: ['fullBank'],
            },
            {
              model: Company,
              as: 'company',
              attributes: ['name', 'fullAddress', 'tax', 'telephone', 'fax'],
            },
            {
              model: ServiceTaxInvoice,
              as: 'taxInvoice',
            },
            {
              model: ServiceReceipt,
              as: 'receipt',
            },
            {
              model: Project,
              as: 'project',
              include: [
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
              ],
              attributes: ['name', 'status', 'contractDate', 'contractAmount'],
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

      const no = await generateNumber();
      req.body.no = no;

      const data = (await Service.create(req.body)) as any;
      await Project.update(
        { status: 'complete', serviceId: data?.id },
        {
          where: { id: req?.body?.projectId },
        }
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
