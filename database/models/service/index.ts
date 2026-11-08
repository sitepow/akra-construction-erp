import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  projectId: {
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
  paymentType: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'cash',
  },
  toBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  completeDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  taxType: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

export default Service;
