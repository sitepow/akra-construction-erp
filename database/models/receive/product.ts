import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ReceiveProduct = sequelize.define('ReceiveProduct', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  poId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'pending',
  },
  dateReceive: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

export default ReceiveProduct;
