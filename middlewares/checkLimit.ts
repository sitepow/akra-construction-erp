import { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

type checkLimitData = {
  count: number;
  lastReset: number;
};

const checkLimitMap = new Map<string, checkLimitData>();

export default function checkLimit(handler: NextApiHandler): NextApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      req.connection?.remoteAddress ||
      '';

    const limit = 3;
    const windowMs = 1 * 60 * 1000;

    if (!checkLimitMap.has(ip)) {
      checkLimitMap.set(ip, {
        count: 0,
        lastReset: Date.now(),
      });
    }

    const ipData = checkLimitMap.get(ip) as checkLimitData;

    if (Date.now() - ipData.lastReset > windowMs) {
      ipData.count = 0;
      ipData.lastReset = Date.now();
    }

    if (ipData.count >= limit) {
      const cooldownTimeMs = windowMs - (Date.now() - ipData.lastReset);
      const cooldownTimeSec = Math.ceil(cooldownTimeMs / 1000);

      return res.status(429).json({
        message: `คุณพยายามส่งคำขอบ่อยเกินไป กรุณาลองใหม่อีกครั้งหลังจาก ${cooldownTimeSec} วินาที`,
      });
    }

    ipData.count += 1;

    return handler(req, res);
  };
}
