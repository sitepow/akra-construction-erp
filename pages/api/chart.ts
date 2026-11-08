import { Project } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, year } = req.query;

  if (req.method === 'GET') {
    try {
      const projects = await Project.findAll({
        attributes: [
          'contractAmount',
          'contractDate',
          'contractEndDate',
          'organization',
          'name',
          'completeDate',
          'fineRate',
        ],
        where: {
          companyId,
          [Op.or]: [
            {
              contractDate: {
                [Op.between]: [`${year}-01-01`, `${year}-12-31`],
              },
            },
            {
              contractEndDate: {
                [Op.between]: [`${year}-01-01`, `${year}-12-31`],
              },
            },
            {
              contractDate: { [Op.lt]: `${year}-01-01` },
              contractEndDate: { [Op.gt]: `${year}-12-31` },
            },
          ],
        },
      });

      res.json(projects);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

export default protect(handler);
