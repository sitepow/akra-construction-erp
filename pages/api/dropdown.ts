import Company from '@/database/models/company';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { category } = req.query;

  if (req.method === 'GET') {
    if (category == 'company') {
      try {
        const data = await Company.findAll({ attributes: ['id', 'name'] });

        res.json(data);
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default handler;
