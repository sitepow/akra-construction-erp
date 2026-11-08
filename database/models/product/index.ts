import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  priceBuy: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  priceSell: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  unit: {
    type: DataTypes.STRING(255),
  },
  remark: {
    type: DataTypes.STRING(255),
  },
});

export default Product;
