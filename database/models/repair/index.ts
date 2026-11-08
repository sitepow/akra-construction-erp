import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Repair = sequelize.define('Repair', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  warehouseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  customerId: { type: DataTypes.INTEGER, allowNull: true },
  paymentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  cause: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  solution: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  isChangePart: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  datePending: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dateComplete: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  partChange: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
});

export default Repair;
