import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  repairId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approvedId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  approvedStatus: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  approvedRemark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  expectedDateReturn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dateReturn: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  modeWithdraw: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  objectiveWithdraw: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  explain: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  totalWithdraw: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  totalReturn: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
});

export default Inventory;
