import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/utils/session';
import { protect } from '@/middlewares/protect';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (req.method === 'POST') {
    try {
      await session.destroy();
      res.json({ message: `ออกจากระบบสำเร็จ` });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
