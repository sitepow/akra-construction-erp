import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Subcontractor = sequelize.define('Subcontractor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  subcontractorPaymentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  no: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  employeeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  duty: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  wage: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  dateStart: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dateEnd: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  dateSendEnd: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'pending',
  },
});

export default Subcontractor;
