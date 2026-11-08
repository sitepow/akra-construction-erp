import { Project, TransferContract } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId } = req.query;

  if (req.method === 'GET') {
    try {
      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const perPage = req.query.perPage
        ? parseInt(req.query.perPage as string)
        : 5;
      const offset = (page - 1) * perPage;

      const { count, rows: projects } = await TransferContract.findAndCountAll({
        offset,
        where: { companyId },
        include: [
          {
            model: Project,
            as: 'project',
            attributes: ['name', 'contractAmount'],
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

      await TransferContract.create(req.body);

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
