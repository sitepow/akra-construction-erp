import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Supplier = sequelize.define('Supplier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fullAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  subDistrict: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  zipcode: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  taxId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

export default Supplier;
