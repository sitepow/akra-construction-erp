import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const EmployeePermission = sequelize.define('EmployeePermission', {
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
  permissions: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
  },
});

export default EmployeePermission;
