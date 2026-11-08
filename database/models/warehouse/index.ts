import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Warehouse = sequelize.define('Warehouse', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  zoneId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: true,
    defaultValue: 'available',
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
  stock: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
});

export default Warehouse;
