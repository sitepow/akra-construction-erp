import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';
import Project from '../project';
import ContractPaperExternal from './external';

const ContractPaper = sequelize.define('ContractPaper', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  editorContentHtml: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  dateNow: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  engineerLevel: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
});

ContractPaper.belongsTo(Project, {
  foreignKey: 'projectId',
  as: 'project',
});

ContractPaper.hasMany(ContractPaperExternal, {
  foreignKey: 'paperId',
  as: 'external',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE',
});

export default ContractPaper;
