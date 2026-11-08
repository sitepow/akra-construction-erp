import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Po = sequelize.define('Po', {
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
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paymentFromBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paymentToBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  receiveId: {
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
  paymentType: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'cash',
  },
  warehouseMode: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'all',
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default Po;
