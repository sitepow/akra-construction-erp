import { NextApiRequest, NextApiResponse } from 'next';
import ContractPaper from '@/database/models/contract/paper';
import Project from '@/database/models/project';
import ContractPaperExternal from '@/database/models/contract/external';
import { protect } from '@/middlewares/protect';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type, category, isPending } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const whereClause: any = { companyId };
        if (isPending) {
          whereClause.status = 'pending';
        }

        const data = await Project.findAll({
          where: whereClause,
          attributes: [
            'id',
            'name',
            'contractDate',
            'contractNo',
            'no',
            'contractAmount',
          ],
          order: [['createdAt', 'DESC']],
        });
        res.json(data);
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
    } else if (type == 'papers') {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const { count, rows: projects } = await ContractPaper.findAndCountAll({
          offset,
          where: { category, companyId },
          include: [
            {
              model: Project,
              as: 'project',
              attributes: ['no', 'name', 'contractNo', 'contractDate'],
            },
            {
              model: ContractPaperExternal,
              as: 'external',
              attributes: ['id'],
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
        return res.status(500).json({ message: error.message });
      }
    } else if (type == 'dashboard') {
      try {
        const contractPapers = (await ContractPaper.findAll({
          where: { companyId },
        })) as any;

        const workCount = contractPapers.filter(
          (paper: any) => paper.category === 'work'
        ).length;
        const constructCount = contractPapers.filter(
          (paper: any) => paper.category === 'construct'
        ).length;
        const engineerCount = contractPapers.filter(
          (paper: any) => paper.category === 'engineer'
        ).length;
        const workerCount = contractPapers.filter(
          (paper: any) => paper.category === 'worker'
        ).length;

        return res.status(200).json({
          work: workCount,
          construct: constructCount,
          engineer: engineerCount,
          worker: workerCount,
        });
      } catch (error: any) {
        console.error(error);
        return res.status(500).json({ message: error.message });
      }
    }
  } else if (req.method == 'POST') {
    try {
      await ContractPaper.create(req.body);
      res.json({ message: 'บันทึกข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
