import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const EmployeeDepartment = sequelize.define('EmployeeDepartment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
});

export default EmployeeDepartment;
