import { NextApiRequest, NextApiResponse } from 'next';
import generator from 'generate-password';
import becrypt from 'bcrypt';
import { Employee } from '@/database';
import { protect } from '@/middlewares/protect';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email } = req.body;

    try {
      if (!email) {
        return res.status(404).json({ message: `กรุณากรอกข้อมูลให้ครบถ้วน` });
      }

      const userValid = await Employee.findOne({ where: { email } });

      if (!userValid) {
        return res.status(404).json({ message: `ไม่พบอีเมลในระบบ` });
      }

      const password = generator.generate({
        length: 32,
        numbers: true,
        symbols: true,
        strict: true,
      });
      const passwordHash = await becrypt.hash(password, 10);

      await Employee.update({ password: passwordHash }, { where: { email } });

      res
        .status(200)
        .json({ message: 'กู้รหัสผ่านสำเร็จ', data: { password } });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
