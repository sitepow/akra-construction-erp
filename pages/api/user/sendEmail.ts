import checkLimit from '@/middlewares/checkLimit';
import { env } from '@/utils';
import { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, subject, message } = req.body;

    const transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });

    try {
      await transporter.sendMail({
        from: `${env.MAIL_NAME} <${env.MAIL_USER}>`,
        to: email,
        subject: subject,
        html: message,
      });

      res.status(200).json({ message: 'ส่งอีเมลสำเร็จ' });
    } catch (error: any) {
      console.error('Error sending email:', error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default checkLimit(handler);
