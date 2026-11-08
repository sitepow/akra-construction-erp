import { Product, ProductCategory } from '@/database';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { companyId, type, categoryId } = req.query;

  if (req.method === 'GET') {
    if (type == 'dropdown') {
      if (categoryId) {
        const data = await Product.findAll({
          where: { categoryId, companyId },
          order: [['createdAt', 'DESC']],
        });
        const newFormat = data?.map((item: any) => {
          const plainItem = item.get({ plain: true });
          return {
            ...plainItem,
            fullProductName: `${plainItem?.name} (${plainItem?.unit})`,
          };
        });
        return res.json(newFormat);
      } else {
        const data = await Product.findAll({
          where: { companyId },
          order: [['createdAt', 'DESC']],
        });
        const newFormat = data?.map((item: any) => {
          const plainItem = item.get({ plain: true });
          return {
            ...plainItem,
            fullProductName: `${plainItem?.name} (${plainItem?.unit})`,
          };
        });
        return res.json(newFormat);
      }
    } else {
      try {
        const page = req.query.page ? parseInt(req.query.page as string) : 1;
        const perPage = req.query.perPage
          ? parseInt(req.query.perPage as string)
          : 20;
        const offset = (page - 1) * perPage;

        const { count, rows: projects } = await Product.findAndCountAll({
          offset,
          where: { companyId },
          include: [
            { model: ProductCategory, as: 'category', attributes: ['name'] },
          ],
          limit: perPage,
          order: [['createdAt', 'DESC']],
        });

        const totalItems = count;
        const allPages = Math.ceil(totalItems / perPage);

        return res.status(200).json({
          data: projects,
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

      await Product.create(req.body);

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
