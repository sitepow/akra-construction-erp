import { Employee } from '@/database';
import Company from '@/database/models/company';
import EmployeeDepartment from '@/database/models/employee/department';
import EmployeePermission from '@/database/models/employee/permission';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';
import becrypt from 'bcrypt';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type, employeeType } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      try {
        const data = await Employee.findAll({
          where: { companyId, employeeType },
          attributes: ['id', 'prefix', 'firstname', 'lastname'],
        });

        const result = data?.map((item: any) => {
          const employee = item.toJSON();
          return {
            ...employee,
            name: `${employee?.prefix}${employee?.firstname} ${employee?.lastname}`,
          };
        });

        res.json(result);
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const { count, rows: projects } = await Employee.findAndCountAll({
          offset,
          include: [
            {
              model: EmployeePermission,
              as: 'permission',
              attributes: ['name'],
            },
            {
              model: EmployeeDepartment,
              as: 'department',
            },
          ],
          limit: perPage,
          order: [['createdAt', 'DESC']],
        });

        const totalItems = count;
        const allPages = Math.ceil(totalItems / perPage);

        const newProjects = await Promise.all(
          projects?.map(async (project: any) => {
            const companies = project?.companies
              ? JSON.parse(project?.companies)
              : [];
            let companiesArray = [] as any;

            if (companies) {
              await Promise.all(
                companies?.map(async (companyId: any) => {
                  const company = (await Company.findOne({
                    where: { id: companyId },
                    attributes: ['name'],
                  })) as any;

                  if (company) {
                    companiesArray.push(company?.name);
                  }
                })
              );
            }

            return { ...project.get({ plain: true }), companiesArray };
          })
        );

        return res.status(200).json({
          data: newProjects,
          page,
          perPage,
          totalItems,
          allPages,
        });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    }
  } else if (req.method === 'POST') {
    try {
      delete req.body.id;
      delete req.body.createdAt;
      delete req.body.updatedAt;
      const { password, email, companies } = req.body;

      const companiesInput = companies || '';

      const companiesArray = companiesInput
        .split(',')
        .map((item: any) => item.trim())
        .filter((item: any) => item !== '')
        .map((item: any) => parseInt(item, 10))
        .filter((item: any) => !isNaN(item));

      const existEmail = await Employee.findOne({
        where: { email },
        attributes: ['id'],
      });

      if (existEmail) {
        return res.status(409).json({ message: 'มีอีเมลนี้แล้วในระบบ' });
      }

      req.body.password = await becrypt.hash(password, 10);
      req.body.companies = companiesArray;
      await Employee.create(req.body);

      res.json({ message: 'สร้างข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
