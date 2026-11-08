import { CompanyBank } from '@/database';
import Company from '@/database/models/company';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Sequelize } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, companyId } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await Company.findAll();
        res.json(data);
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else if (type == 'modal') {
      try {
        const data = await Company.findOne({
          where: { id: companyId },
          attributes: ['id', 'name'],
          include: [
            {
              model: CompanyBank,
              as: 'bank',
              where: {
                poId: Sequelize.col('Company.id'),
              },
              attributes: {
                exclude: ['companyId', 'createdAt', 'updatedAt'],
              },
              required: false,
            },
          ],
          order: [[{ model: CompanyBank, as: 'bank' }, 'createdAt', 'DESC']],
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

        const { count, rows: projects } = await Company.findAndCountAll({
          offset,
          limit: perPage,
          include: [
            {
              model: CompanyBank,
              as: 'bank',
              where: {
                poId: Sequelize.col('Company.id'),
              },
              attributes: { exclude: ['companyId', 'createdAt', 'updatedAt'] },
              required: false,
            },
          ],
          order: [[{ model: CompanyBank, as: 'bank' }, 'createdAt', 'DESC']],
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

      await Company.create(req.body);

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
