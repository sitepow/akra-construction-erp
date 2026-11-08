import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ProductCategory = sequelize.define('ProductCategory', {
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
  remark: {
    type: DataTypes.STRING(255),
  },
});

export default ProductCategory;
