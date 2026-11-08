import { SessionData, sessionOptions } from '@/utils/session';
import { verifyTokens, getRefreshToken } from '@/utils';
import { getIronSession } from 'iron-session';
import { NextApiRequest, NextApiResponse } from 'next';

export const protect = (
  handler: (req: NextApiRequest, res: NextApiResponse) => void
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    if (!session?.token?.accessToken) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = verifyTokens(session.token.accessToken).accessToken();
      req.user = decoded;

      return handler(req, res);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        try {
          const newToken = await getRefreshToken(session?.token?.refreshToken);

          session.token = {
            accessToken: newToken.accessToken,
            refreshToken: session?.token?.refreshToken,
          };
          await session.save();

          req.user = verifyTokens(newToken.accessToken).accessToken();
          return handler(req, res);
        } catch (refreshError: any) {
          if (
            refreshError.message === 'Refresh token expired' ||
            refreshError.message === 'Invalid refresh token'
          ) {
            await session.destroy();
            return res
              .status(401)
              .json({ message: 'Session expired, please log in again' });
          }

          return res.status(500).json({ message: 'Unable to refresh token' });
        }
      } else if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      } else {
        return res.status(500).json({ message: 'Internal server error' });
      }
    }
  };
};
