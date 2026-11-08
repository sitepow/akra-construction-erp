import { Project, ProjectStampSlip } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await ProjectStampSlip.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

      await ProjectStampSlip.update(newValues, { where: { id } });
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'DELETE') {
    try {
      const project = (await Project.findOne({
        where: { stampId: id },
      })) as any;

      if (project) {
        await Project.update({ stampId: null }, { where: { id: project?.id } });
      }

      await ProjectStampSlip.destroy({ where: { id } });

      res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
