import { Project, Service } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Service.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

      await Service.update(newValues, { where: { id } });
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'DELETE') {
    try {
      const findService = (await Service.findOne({
        where: { id },
        attributes: ['projectId'],
      })) as any;

      await Service.destroy({ where: { id } });

      await Project.update(
        { status: 'pending', serviceId: null },
        { where: { id: findService?.projectId } }
      );

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
