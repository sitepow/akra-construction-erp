import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const WarehouseCategory = sequelize.define('WarehouseCategory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
});

export default WarehouseCategory;
