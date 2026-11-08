import { NextApiRequest, NextApiResponse } from 'next';
import becrypt from 'bcrypt';
import { protect } from '@/middlewares/protect';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/utils/session';
import { Employee } from '@/database';
import { createTokens } from '@/utils';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (req.method === 'POST') {
    const { email, oldPassword, newPassword } = req.body;

    try {
      if (!email || !oldPassword || !newPassword) {
        return res.status(404).json({ message: `กรุณากรอกข้อมูลให้ครบถ้วน` });
      }

      const userValid = (await Employee.findOne({ where: { email } })) as any;

      if (!userValid) {
        return res.status(404).json({ message: `ไม่พบอีเมลในระบบ` });
      }

      const oldPasswordValid = await becrypt.compare(
        oldPassword,
        userValid.password
      );

      if (!oldPasswordValid) {
        return res.status(401).json({ message: `รหัสผ่านเก่าไม่ถูกต้อง` });
      }

      const newPasswordExist = await becrypt.compare(
        newPassword,
        userValid.password
      );

      if (newPasswordExist) {
        return res
          .status(401)
          .json({ message: `รหัสผ่านนี้คุณกำลังใช้งานอยู่` });
      }

      const passwordHash = await becrypt.hash(newPassword, 10);
      await Employee.update({ password: passwordHash }, { where: { email } });

      const userFormatData = {
        userId: userValid?.id,
        email: userValid?.email,
      };

      const accessToken = createTokens(userFormatData).accessToken();
      const refreshToken = createTokens(userFormatData).refreshToken();
      session.token = {
        accessToken,
        refreshToken,
      };
      await session.save();

      res.status(200).json({ message: 'เปลี่ยนรหัสผ่านสำเร็จ' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
