import {
  CompanyBank,
  DeliveryNote,
  Po,
  Product,
  ProductCategory,
  Project,
  ProjectGuaranteeSlip,
  ProjectStampSlip,
  Quo,
  Receipt,
  ReceiveProduct,
  Subcontractor,
  SubcontractorPayment,
  Supplier,
  SupplierBank,
  TaxInvoice,
} from '@/database';
import Company from '@/database/models/company';
import Customer from '@/database/models/customer';
import CustomerBank from '@/database/models/customer/bank';
import Employee from '@/database/models/employee';
import EmployeeDepartment from '@/database/models/employee/department';
import { protect } from '@/middlewares/protect';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { type, companyId } = req.query;

  if (req.method === 'GET') {
    if (type == 'bank') {
      try {
        const bankCount = await Company.count();
        const bankAccountCount = await CompanyBank.count();
        res.json({ bankCount, bankAccountCount });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else if (type == 'employee') {
      try {
        const employeeCount = await Employee.count({ where: { companyId } });
        const employeeFullTimeCount = await Employee.count({
          where: {
            employeeType: 'พนักงานประจำ',
            companyId,
          },
        });
        const employeePartTimeCount = await Employee.count({
          where: {
            employeeType: 'พนักงานชั่วคราว',
            companyId,
          },
        });
        const employeeDayCount = await Employee.count({
          where: {
            employeeType: 'พนักงานรายวัน',
            companyId,
          },
        });
        const employeeSubcontractorCount = await Employee.count({
          where: {
            employeeType: 'ผู้รับเหมาช่วง',
            companyId,
          },
        });
        res.json({
          employeeCount,
          employeeFullTimeCount,
          employeePartTimeCount,
          employeeDayCount,
          employeeSubcontractorCount,
        });
      } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
      }
    } else if (type == 'project') {
      const projectTotal = await Project.count({
        where: { companyId },
      });
      const projectPendingCount = await Project.count({
        where: { status: 'pending', companyId },
      });
      const projectSuccessCount = await Project.count({
        where: { status: 'complete', companyId },
      });
      const successPercentage =
        projectTotal > 0 ? (projectSuccessCount / projectTotal) * 100 : 0;
      res.json({
        projectPendingCount,
        projectSuccessCount,
        successPercentage: successPercentage.toFixed(2),
      });
    } else if (type == 'paperSlip') {
      const projectGuaranteePendingSlipCount = await ProjectGuaranteeSlip.count(
        {
          where: { status: 'pending', companyId },
        }
      );
      const projectGuaranteeSuccessSlipCount = await ProjectGuaranteeSlip.count(
        {
          where: { status: 'complete', companyId },
        }
      );
      const projectStampPendingSlipCount = await ProjectStampSlip.count({
        where: { status: 'pending', companyId },
      });
      const projectStampSuccessSlipCount = await ProjectStampSlip.count({
        where: { status: 'complete', companyId },
      });
      res.json({
        projectGuaranteePendingSlipCount,
        projectGuaranteeSuccessSlipCount,
        projectStampPendingSlipCount,
        projectStampSuccessSlipCount,
      });
    } else if (type == 'supplier') {
      const supplierCount = await Supplier.count({
        where: { companyId },
      });
      const supplierAccountBankCount = await SupplierBank.count({
        where: { companyId },
      });
      res.json({ supplierCount, supplierAccountBankCount });
    } else if (type == 'po') {
      const poCount = await Po.count({ where: { companyId } });
      const poPendingCount = await Po.count({
        where: { companyId, status: 'pending' },
      });
      const poSuccessCount = await Po.count({
        where: { companyId, status: 'complete' },
      });
      const poPendingNetTotal = await Po.sum('totalAmount', {
        where: { companyId, status: 'pending' },
      });
      const poSuccessNetTotal = await Po.sum('totalAmount', {
        where: { companyId, status: 'complete' },
      });
      const poNetTotal = await Po.sum('netAmount', { where: { companyId } });
      res.json({
        poCount,
        poPendingCount,
        poSuccessCount,
        poPendingNetTotal,
        poSuccessNetTotal,
        poNetTotal,
      });
    } else if (type == 'quo') {
      const quoCount = await Quo.count({ where: { companyId } });
      const quoPendingCount = await Quo.count({
        where: { companyId, status: 'pending' },
      });
      const quoNotInterestedCount = await Quo.count({
        where: { companyId, status: 'notInterested' },
      });
      const quoSuccessCount = await Quo.count({
        where: { companyId, status: 'complete' },
      });
      const quoNotInterestedNetTotal = await Quo.sum('totalAmount', {
        where: { companyId, status: 'notInterested' },
      });
      const quoSuccessNetTotal = await Quo.sum('totalAmount', {
        where: { companyId, status: 'complete' },
      });
      const quoNetTotal = await Quo.sum('netAmount', { where: { companyId } });
      res.json({
        quoCount,
        quoPendingCount,
        quoNotInterestedCount,
        quoSuccessCount,
        quoNotInterestedNetTotal,
        quoSuccessNetTotal,
        quoNetTotal,
      });
    } else if (type == 'product') {
      const productCount = await Product.count({ where: { companyId } });
      const productCategoryCount = await ProductCategory.count({
        where: { companyId },
      });
      res.json({ productCount, productCategoryCount });
    } else if (type == 'customer') {
      const customerCount = await Customer.count({ where: { companyId } });
      const customerBankCount = await CustomerBank.count({
        where: { companyId },
      });
      res.json({ customerCount, customerBankCount });
    } else if (type == 'subcontractor') {
      const subcontractorCount = await Subcontractor.count({
        where: { companyId },
      });
      const NetTotal = await Subcontractor.sum('wage', {
        where: { companyId },
      });
      const pendingNetTotal = await Subcontractor.sum('wage', {
        where: { companyId, status: 'pending' },
      });
      const successNetTotal = await Subcontractor.sum('wage', {
        where: { companyId, status: 'complete' },
      });
      res.json({
        subcontractorCount,
        NetTotal,
        pendingNetTotal,
        successNetTotal,
      });
    } else if (type == 'receiveProduct') {
      const receiveProductCount = await ReceiveProduct.count({
        where: { companyId },
      });
      const receiveProductNetTotal = await ReceiveProduct.findAll({
        attributes: ['id'],
        where: { companyId },
        include: [
          {
            model: Po,
            as: 'po',
            attributes: ['netAmount'],
          },
        ],
      });

      const totalNet = receiveProductNetTotal?.reduce(
        (acc: number, item: any) => acc + (item?.po?.netAmount || 0),
        0
      );

      res.json({ receiveProductCount, totalNet });
    } else if (type == 'employeeDepartment') {
      const departmentCount = await EmployeeDepartment.count({
        where: { companyId },
      });

      res.json({ departmentCount });
    } else if (type == 'deliveryNote') {
      const deliveryNoteCount = await DeliveryNote.count({
        where: { companyId },
      });

      res.json({ deliveryNoteCount });
    } else if (type == 'taxInvoice') {
      const TaxInvoiceCount = await TaxInvoice.count({
        where: { companyId },
      });

      res.json({ TaxInvoiceCount });
    } else if (type == 'receipt') {
      const ReceiptCount = await Receipt.count({
        where: { companyId },
      });

      res.json({ ReceiptCount });
    } else if (type == 'subcontractorPayment') {
      const subcontractorPaymentCount = await SubcontractorPayment.count({
        where: { companyId },
      });

      res.json({ subcontractorPaymentCount });
    }
  }

  res.status(405).end(`Method ${req.method} Not Allowed`);
};

export default protect(handler);
