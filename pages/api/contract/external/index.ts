import ContractPaperExternal from '@/database/models/contract/external';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { paperId } = req.query;

  if (req.method == 'GET') {
    try {
      const data = await ContractPaperExternal.findAll({
        where: { paperId },
      });
      res.json(data);
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  } else if (req.method == 'POST') {
    try {
      await ContractPaperExternal.create(req.body);
      res.json({ message: 'บันทึกข้อมูลสำเร็จแล้ว' });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
