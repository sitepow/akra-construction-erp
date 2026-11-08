import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ServiceReceipt = sequelize.define('ServiceReceipt', {
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
    allowNull: true,
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
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
    type: DataTypes.STRING(655),
    allowNull: true,
  },
});

export default ServiceReceipt;
