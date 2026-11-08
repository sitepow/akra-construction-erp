import { NextApiRequest, NextApiResponse } from 'next';
import { getIronSession } from 'iron-session';
import { sessionOptions, defaultSession, SessionData } from '@/utils/session';
import { protect } from '@/middlewares/protect';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = (await getIronSession<SessionData>(
    req,
    res,
    sessionOptions
  )) as any;

  if (req.method === 'GET') {
    if (session.isLoggedIn !== true) {
      res.status(200).json(defaultSession);
    } else {
      delete session.token;
      res.status(200).json(session);
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
