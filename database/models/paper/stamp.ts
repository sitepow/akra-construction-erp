import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ProjectStampSlip = sequelize.define('ProjectStampSlip', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  stampAmount: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  stampDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  reciveDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: false,
    defaultValue: 'pending',
  },
});

export default ProjectStampSlip;
