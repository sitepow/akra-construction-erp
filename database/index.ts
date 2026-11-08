import sequelize from './config';
import Project from './models/project';
import TransferContract from './models/smebank/transferContract';
import Supplier from './models/supplier';
import SupplierBank from './models/supplier/bank';
import ProjectGuaranteeSlip from './models/paper/guarantee';
import ProjectStampSlip from './models/paper/stamp';
import Product from './models/product';
import ProductCategory from './models/product/category';
import CompanyBank from './models/company/bank';
import Company from './models/company';
import Po from './models/account/po';
import PoProduct from './models/account/po/product';
import CustomerBank from './models/customer/bank';
import Customer from './models/customer';
import Subcontractor from './models/subcontractor';
import Employee from './models/employee';
import ReceiveProduct from './models/receive/product';
import EmployeeDepartment from './models/employee/department';
import Quo from './models/account/quo';
import QuoProduct from './models/account/quo/product';
import Warehouse from './models/warehouse';
import WarehouseZone from './models/warehouse/zone';
import DeliveryNote from './models/account/deliveryNote';
import TaxInvoice from './models/account/taxInvoice';
import Receipt from './models/account/receipt';
import SubcontractorPayment from './models/subcontractor/payment';
import Service from './models/service';
import ServiceTaxInvoice from './models/service/taxInvoice';
import ServiceReceipt from './models/service/receipt';
import WarehouseCategory from './models/warehouse/category';
import Inventory from './models/inventory';
import Repair from './models/repair';
import InventoryWithdraw from './models/inventory/withdraw';
import InventoryReturn from './models/inventory/return';
import RepairPayment from './models/repair/payment';
import EmployeePermission from './models/employee/permission';

TransferContract.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

SupplierBank.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier',
});

CustomerBank.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});

ProjectGuaranteeSlip.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

ProjectStampSlip.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Product.belongsTo(ProductCategory, {
  foreignKey: 'categoryId',
  as: 'category',
});

CompanyBank.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Po.belongsTo(Supplier, {
  foreignKey: 'supplierId',
  as: 'supplier',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Po.belongsTo(SupplierBank, {
  foreignKey: 'paymentToBankId',
  as: 'toSupplier',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Po.belongsTo(CompanyBank, {
  foreignKey: 'paymentFromBankId',
  as: 'fromCompany',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Po.hasMany(PoProduct, {
  foreignKey: 'poId',
  as: 'poProducts',
});

PoProduct.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

PoProduct.belongsTo(Po, {
  foreignKey: 'poId',
  as: 'po',
});

Subcontractor.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Subcontractor.belongsTo(Employee, {
  foreignKey: 'employeeId',
  as: 'employee',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

ReceiveProduct.belongsTo(Po, {
  foreignKey: 'poId',
  as: 'po',
});

Employee.belongsTo(EmployeeDepartment, {
  foreignKey: 'departmentId',
  as: 'department',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Quo.belongsTo(CompanyBank, {
  foreignKey: 'paymentToBankId',
  as: 'toCompany',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Quo.hasMany(QuoProduct, {
  foreignKey: 'quoId',
  as: 'poProducts',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Quo.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

QuoProduct.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

Warehouse.belongsTo(Product, {
  foreignKey: 'productId',
  as: 'product',
});

Warehouse.belongsTo(WarehouseZone, {
  foreignKey: 'zoneId',
  as: 'zone',
});

DeliveryNote.belongsTo(Quo, {
  foreignKey: 'quoId',
  as: 'Quo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

TaxInvoice.belongsTo(Quo, {
  foreignKey: 'quoId',
  as: 'Quo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Receipt.belongsTo(Quo, {
  foreignKey: 'quoId',
  as: 'Quo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

SubcontractorPayment.belongsTo(Subcontractor, {
  foreignKey: 'subcontractorId',
  as: 'subcontractor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

SubcontractorPayment.belongsTo(CompanyBank, {
  foreignKey: 'paymentFromBankId',
  as: 'fromCompany',
});

Quo.belongsTo(DeliveryNote, {
  foreignKey: 'deliveryNoteId',
  as: 'deliveryNote',
});

Quo.belongsTo(TaxInvoice, {
  foreignKey: 'taxInvoiceId',
  as: 'taxInvoice',
});

Quo.belongsTo(Receipt, {
  foreignKey: 'receiptId',
  as: 'receipt',
});

Quo.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
});

Subcontractor.belongsTo(SubcontractorPayment, {
  foreignKey: 'subcontractorPaymentId',
  as: 'subcontractorPayment',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

SubcontractorPayment.belongsTo(CompanyBank, {
  foreignKey: 'paymentFromBankId',
  as: 'fromBank',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Service.belongsTo(ServiceTaxInvoice, {
  foreignKey: 'taxInvoiceId',
  as: 'taxInvoice',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Service.belongsTo(ServiceReceipt, {
  foreignKey: 'receiptId',
  as: 'receipt',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Service.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Service.belongsTo(Company, {
  foreignKey: 'companyId',
  as: 'company',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ServiceTaxInvoice.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

ServiceReceipt.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Service.belongsTo(CompanyBank, {
  foreignKey: 'toBankId',
  as: 'toBank',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Po.belongsTo(ReceiveProduct, {
  foreignKey: 'receiveId',
  as: 'receiveProduct',
});

Warehouse.belongsTo(WarehouseCategory, {
  foreignKey: 'categoryId',
  as: 'warehouseCategory',
});

Inventory.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

Repair.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse',
});

Inventory.hasMany(InventoryWithdraw, {
  foreignKey: 'inventoryId',
  as: 'inventoryWithdraw',
});

Inventory.hasMany(InventoryReturn, {
  foreignKey: 'inventoryId',
  as: 'inventoryReturn',
});

InventoryWithdraw.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse',
});

InventoryReturn.belongsTo(Warehouse, {
  foreignKey: 'warehouseId',
  as: 'warehouse',
});

Inventory.belongsTo(Repair, { foreignKey: 'repairId', as: 'repair' });

Company.hasMany(CompanyBank, {
  foreignKey: 'companyId',
  as: 'bank',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Supplier.hasMany(SupplierBank, {
  foreignKey: 'supplierId',
  as: 'bank',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Project.belongsTo(Service, {
  foreignKey: 'serviceId',
  as: 'service',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Project.belongsTo(Customer, {
  foreignKey: 'customerId',
  as: 'customer',
});

Project.belongsTo(ProjectGuaranteeSlip, {
  foreignKey: 'guaranteeId',
  as: 'guarantee',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Project.belongsTo(ProjectStampSlip, {
  foreignKey: 'stampId',
  as: 'stamp',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

Repair.hasMany(Inventory, {
  foreignKey: 'repairId',
  as: 'inventory',
});

Project.hasMany(Inventory, {
  foreignKey: 'projectId',
  as: 'inventory',
});

Inventory.hasMany(InventoryWithdraw, {
  foreignKey: 'inventoryId',
  as: 'withdraw',
});

Inventory.hasMany(InventoryReturn, {
  foreignKey: 'inventoryId',
  as: 'return',
});

Repair.belongsTo(RepairPayment, {
  foreignKey: 'paymentId',
  as: 'payment',
  onDelete: 'SET NULL',
  onUpdate: 'SET NULL',
});

RepairPayment.belongsTo(Repair, {
  foreignKey: 'repairId',
  as: 'repair',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

Employee.belongsTo(EmployeePermission, {
  foreignKey: 'permissionId',
  as: 'permission',
});

export {
  Project,
  TransferContract,
  SupplierBank,
  Supplier,
  ProjectGuaranteeSlip,
  ProjectStampSlip,
  Product,
  ProductCategory,
  CompanyBank,
  Po,
  PoProduct,
  CustomerBank,
  Customer,
  Subcontractor,
  ReceiveProduct,
  Employee,
  Quo,
  QuoProduct,
  Warehouse,
  DeliveryNote,
  TaxInvoice,
  Receipt,
  SubcontractorPayment,
  ServiceTaxInvoice,
  Service,
  ServiceReceipt,
  Inventory,
  Repair,
};
export default sequelize;
