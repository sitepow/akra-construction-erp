import { NextApiRequest, NextApiResponse } from 'next';
import becrypt from 'bcrypt';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/utils/session';
import { Employee } from '@/database';
import EmployeePermission from '@/database/models/employee/permission';
import checkLimit from '@/middlewares/checkLimit';
import { createTokens } from '@/utils';
import Company from '@/database/models/company';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (req.method === 'POST') {
    try {
      const { email, password, companyId } = req.body;

      if (!email || !password) {
        return res.status(404).json({ message: `กรุณากรอกข้อมูลให้ครบถ้วน` });
      }

      const company = (await Company.findOne({
        where: { id: companyId },
        attributes: ['name', 'guaranteeHeader'],
      })) as any;

      const user = (await Employee.findOne({
        where: { email },
        attributes: [
          'id',
          'email',
          'password',
          'prefix',
          'firstname',
          'lastname',
          'companies',
        ],
        include: [
          {
            model: EmployeePermission,
            as: 'permission',
            attributes: ['permissions'],
          },
        ],
      })) as any;

      const companies = user?.companies ? JSON.parse(user.companies) : [];
      const includeCompany = companies?.some((item: any) => item == companyId);

      if (!includeCompany) {
        return res
          .status(404)
          .json({ message: `ไม่สิทธิ์เข้าถึงข้อมูลในบริษัทนี้` });
      }

      if (!user) {
        return res.status(404).json({ message: `ไม่มีอีเมลนี้ในระบบ` });
      }

      const passwordValid = await becrypt.compare(
        password,
        user?.password || ''
      );

      if (!passwordValid) {
        return res.status(401).json({ message: `รหัสผ่านไม่ถูกต้อง` });
      }

      const userFormatData = {
        userId: user?.id,
        email: user?.email,
      };

      const accessToken = createTokens(userFormatData).accessToken();
      const refreshToken = createTokens(userFormatData).refreshToken();

      session.userId = user?.id;
      session.email = user?.email;
      session.permissions = user?.permission?.permissions;
      session.company = {
        id: companyId,
        name: company?.name,
        guaranteeHeader: company?.guaranteeHeader,
      };
      session.name = `${user?.prefix}${user?.firstname} ${user?.lastname}`;
      session.isLoggedIn = true;
      session.token = {
        accessToken,
        refreshToken,
      };
      await session.save();

      res.json({
        message: `เข้าสู่ระบบสำเร็จ`,
        permissions: user?.permission?.permissions,
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default checkLimit(handler);
