import { Project, Service, ServiceTaxInvoice } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId } = req.query;
  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const count = await ServiceTaxInvoice.count();

    if (count >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = count + 1;

    const countNumber = `TIV-${nextNumber.toString().padStart(8, '0')}`;

    return countNumber;
  };

  if (req.method === 'GET') {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const perPage = req.query.perPage
        ? parseInt(req.query.perPage as string)
        : 20;
      const offset = (page - 1) * perPage;

      const { count, rows: projects } = await ServiceTaxInvoice.findAndCountAll(
        {
          offset,
          where: { companyId },
          include: [
            {
              model: Service,
              as: 'service',
              attributes: ['no'],
              include: [
                { model: Project, as: 'project', attributes: ['name'] },
              ],
            },
          ],
          limit: perPage,
          order: [['createdAt', 'DESC']],
        }
      );

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

      const no = await generateNumber();
      req.body.no = no;

      const data = (await ServiceTaxInvoice.create(req.body)) as any;
      await Service.update(
        { taxInvoiceId: data?.id },
        {
          where: { id: req.body.serviceId },
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
