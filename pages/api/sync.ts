import { NextApiRequest, NextApiResponse } from 'next';
import sequelize from '@/database/config';
import '@/database/models/project';
import '@/database/models/contract/paper';
import '@/database/models/contract/external';
import '@/database/models/company';
import '@/database/models/smebank/transferContract';
import '@/database/models/smebank/reciveContract';
import '@/database/models/supplier';
import '@/database/models/supplier/bank';
import '@/database/models/paper/guarantee';
import '@/database/models/paper/stamp';
import '@/database/models/product';
import '@/database/models/product/category';
import '@/database/models/company';
import '@/database/models/company/bank';
import '@/database/models/account/po';
import '@/database/models/account/po/product';
import '@/database/models/customer';
import '@/database/models/customer/bank';
import '@/database/models/subcontractor';
import '@/database/models/receive/product';
import '@/database/models/account/quo';
import '@/database/models/account/quo/product';
import '@/database/models/warehouse';
import '@/database/models/warehouse/zone';
import '@/database/models/account/deliveryNote';
import '@/database/models/account/taxInvoice';
import '@/database/models/account/receipt';
import '@/database/models/subcontractor/payment';
import '@/database/models/employee';
import '@/database/models/employee/department';
import '@/database/models/service';
import '@/database/models/service/taxInvoice';
import '@/database/models/service/receipt';
import '@/database/models/warehouse/category';
import '@/database/models/inventory';
import '@/database/models/inventory/withdraw';
import '@/database/models/inventory/return';
import '@/database/models/repair';
import '@/database/models/repair/payment';
import '@/database/models/employee/permission';
import checkLimit from '@/middlewares/checkLimit';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      await sequelize.sync({ alter: true, force: false });
      res.status(200).json({ message: 'ซิงค์ฐานข้อมูลสำเร็จ' });
    } catch (error: any) {
      console.error('Database sync error:', error);
      res
        .status(500)
        .json({ error: 'Failed to sync database', message: error.message });
    }
    return;
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default checkLimit(handler);
