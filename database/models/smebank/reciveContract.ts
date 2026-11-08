import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ReciveContract = sequelize.define('ReciveContract', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reciveAmountDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  netContract50Amount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  reciveAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  borrowDuration: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  borrowDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  netAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});

export default ReciveContract;
