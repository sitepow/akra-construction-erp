import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const SubcontractorPayment = sequelize.define('SubcontractorPayment', {
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
  subcontractorId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'notComplete',
  },
  paymentType: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'cash',
  },
  paymentFromBankId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  paymentDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
});

export default SubcontractorPayment;
