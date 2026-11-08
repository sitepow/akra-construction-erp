import { Project, Subcontractor, SubcontractorPayment } from '@/database';
import Employee from '@/database/models/employee';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type } = req.query;

  const MAX_PO_NUMBER = 999999999;

  const generateNumber = async () => {
    const poCount = await Subcontractor.count();

    if (poCount >= MAX_PO_NUMBER) {
      throw new Error('PO number limit exceeded');
    }

    const nextNumber = poCount + 1;

    const poNumber = `SUB-${nextNumber.toString().padStart(8, '0')}`;

    return poNumber;
  };

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      const data = await Subcontractor.findAll({
        where: { companyId },
        attributes: ['id', 'no'],
      });

      res.json(data);
      try {
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

        const { count, rows: projects } = await Subcontractor.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            {
              model: SubcontractorPayment,
              as: 'subcontractorPayment',
              attributes: ['status', 'no'],
            },
            { model: Project, as: 'project', attributes: ['name'] },
            {
              model: Employee,
              as: 'employee',
              attributes: ['prefix', 'firstname', 'lastname', 'fullBank'],
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

      const quoNumber = await generateNumber();
      req.body.no = quoNumber;

      await Subcontractor.create(req.body);

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
