import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const RepairPayment = sequelize.define('RepairPayment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  repairId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approvedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approvedRemark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  paymentType: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  fixStatus: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  datePayment: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  paymentFromBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  explain: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  expenses: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
});

export default RepairPayment;
