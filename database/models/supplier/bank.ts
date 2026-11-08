import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const SupplierBank = sequelize.define('SupplierBank', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  supplierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
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

export default SupplierBank;
