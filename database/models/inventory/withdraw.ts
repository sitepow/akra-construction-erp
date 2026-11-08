import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const InventoryWithdraw = sequelize.define('InventoryWithdraw', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  inventoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  warehouseId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  qty: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
});

export default InventoryWithdraw;
