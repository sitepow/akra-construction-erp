import {
  CompanyBank,
  Employee,
  Project,
  Subcontractor,
  SubcontractorPayment,
} from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await Subcontractor.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `PAY-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const perPage = req.query.perPage
        ? parseInt(req.query.perPage as string)
        : 20;
      const offset = (page - 1) * perPage;

      const { count, rows: projects } =
        await SubcontractorPayment.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: CompanyBank,
              as: 'fromBank',
              attributes: ['fullBank'],
            },
            {
              model: Subcontractor,
              as: 'subcontractor',
              attributes: ['no', 'duty', 'wage', 'status'],
              include: [
                { model: Project, as: 'project', attributes: ['name'] },
                {
                  model: Employee,
                  as: 'employee',
                  attributes: ['prefix', 'firstname', 'lastname', 'fullBank'],
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
      const { paymentFromBankId } = req.body;
      req.body.paymentFromBankId = paymentFromBankId ? paymentFromBankId : null;

      const quoNumber = await generateNumber();
      req.body.no = quoNumber;

      const data = (await SubcontractorPayment.create(req.body)) as any;
      await Subcontractor.update(
        { subcontractorPaymentId: data?.id, status: 'complete' },
        { where: { id: req.body.subcontractorId } }
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
