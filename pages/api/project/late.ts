import Project from '@/database/models/project';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import { Op } from 'sequelize';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    const { companyId, type } = req.query as any;

    if (type === 'projects') {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const whereClause: any = { companyId };
        const currentDate = new Date();
        whereClause.contractEndDate = {
          [Op.lt]: currentDate,
        };

        const { count, rows: projects } = await Project.findAndCountAll({
          where: whereClause,
          attributes: [
            'no',
            'name',
            'status',
            'contractNo',
            'organization',
            'contractAmount',
            'contractDate',
            'contractEndDate',
            'fineRate',
          ],
          offset,
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
        return res.status(500).json({ message: error.message });
      }
    } else if (type === 'dashboard') {
      try {
        const whereClause: any = { companyId };
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        whereClause.contractEndDate = {
          [Op.lt]: currentDate,
        };

        const projects = (await Project.findAll({
          attributes: ['contractEndDate', 'fineRate', 'contractAmount'],
          where: whereClause,
          order: [['createdAt', 'DESC']],
        })) as any;

        let contractAmountTotal = 0;
        let fineRateTotal = 0;

        for (const project of projects) {
          const endDate = project.contractEndDate
            ? new Date(project.contractEndDate)
            : null;

          if (endDate) {
            endDate.setHours(0, 0, 0, 0);
          }

          let lateDays = 0;
          if (endDate && currentDate > endDate) {
            lateDays = Math.floor(
              (currentDate.getTime() - endDate.getTime()) /
                (1000 * 60 * 60 * 24)
            );
          }

          const projectFineRateTotal = (project.fineRate || 0) * lateDays;
          fineRateTotal += projectFineRateTotal;

          contractAmountTotal += project.contractAmount || 0;
        }

        const fineRateNet = contractAmountTotal - fineRateTotal;

        return res.status(200).json({
          projectCount: projects.length,
          contractAmountTotal,
          fineRateTotal,
          fineRateNet,
        });
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
    } else {
      return res.status(400).json({ message: 'Invalid type parameter' });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
