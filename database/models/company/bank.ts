import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const CompanyBank = sequelize.define('CompanyBank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  fullBank: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankBranch: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankType: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankAccount: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
});

export default CompanyBank;
