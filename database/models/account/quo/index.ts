import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Quo = sequelize.define('Quo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  deliveryNoteId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  taxInvoiceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receiptId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paymentToBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'pending',
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  pendingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  paymentType: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'cash',
  },
  taxType: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  vat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default Quo;
