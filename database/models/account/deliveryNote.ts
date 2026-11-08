import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const DeliveryNote = sequelize.define('DeliveryNote', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  carNo: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  driverName: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  driverPhone: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  quoId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'pending',
  },
  pendingDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  completeDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  remark: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

export default DeliveryNote;
