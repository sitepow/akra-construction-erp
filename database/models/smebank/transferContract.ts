import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const TransferContract = sequelize.define('TransferContract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  transferDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  reciveAmountDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  reciveAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  borrowDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  borrowDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  interestAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default TransferContract;
