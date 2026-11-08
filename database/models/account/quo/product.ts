import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const QuoProduct = sequelize.define('QuoProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  quoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  productId: {
    type: DataTypes.INTEGER,
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
    allowNull: true,
    defaultValue: 0,
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

export default QuoProduct;
