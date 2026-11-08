import Employee from '@/database/models/employee';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await Employee.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'PUT') {
    try {
      const { id: _, createdAt: __, updatedAt: ___, ...newValues } = req.body;

      const companiesInput = newValues?.companies || '';

      const companiesArray = companiesInput
        .split(',')
        .map((item: any) => item.trim())
        .filter((item: any) => item !== '')
        .map((item: any) => parseInt(item, 10))
        .filter((item: any) => !isNaN(item));

      await Employee.update(
        { ...newValues, companies: companiesArray },
        { where: { id } }
      );
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  } else if (req.method === 'DELETE') {
    try {
      await Employee.destroy({ where: { id } });

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
