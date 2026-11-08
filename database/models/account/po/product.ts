import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const PoProduct = sequelize.define('PoProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  poId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  qty: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0,
  },
  totalAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  isCanFix: {
    type: DataTypes.STRING(155),
    allowNull: true,
    defaultValue: 'not_fix',
  },
  isCanSell: {
    type: DataTypes.STRING(155),
    allowNull: true,
    defaultValue: 'not_sell',
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

export default PoProduct;
