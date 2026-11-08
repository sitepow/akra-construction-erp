import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  no: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  name: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  contractNo: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  organization: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  contractAmount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  contractDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  contractEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  guaranteeAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  guaranteeStatus: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  guaranteeNumber: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  guaranteeEndDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fineRate: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: true,
    defaultValue: 'pending',
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  customerId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  guaranteeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stampId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  completeDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },
});

export default Project;
