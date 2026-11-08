import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Company = sequelize.define('Company', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  guaranteeHeader: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  },
  name: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  color: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  fullAddress: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
  tax: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
  fax: {
    type: DataTypes.STRING(65),
    allowNull: true,
  },
});

export default Company;
