import { NextApiRequest, NextApiResponse } from 'next';
import ContractPaper from '@/database/models/contract/paper';
import { protect } from '@/middlewares/protect';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const data = await ContractPaper.findOne({ where: { id } });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      await ContractPaper.update(req.body, { where: { id } });
      res.json({ message: 'แก้ไขข้อมูลสำเร็จแล้วแล้ว' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      await ContractPaper.destroy({ where: { id } });

      res.json({ message: 'ลบข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
