import { NextApiRequest, NextApiResponse } from 'next';
import { protect } from '@/middlewares/protect';
import { Employee } from '@/database';
import becrypt from 'bcrypt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { employeeId } = req.body;

    try {
      if (!employeeId) {
        return res.status(404).json({ message: `กรุณากรอกข้อมูลให้ครบถ้วน` });
      }

      const userValid = (await Employee.findOne({
        where: { id: employeeId },
      })) as any;

      if (!userValid) {
        return res.status(404).json({ message: `ไม่พบอีเมลในระบบ` });
      }

      const randomPassword = Math.floor(1000 + Math.random() * 9000);

      const passwordHash = await becrypt.hash(randomPassword.toString(), 10);
      await Employee.update(
        { password: passwordHash },
        { where: { id: employeeId } }
      );

      res
        .status(200)
        .json({ message: 'รีเซ็ตรหัสผ่านสำเร็จ', password: randomPassword });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
