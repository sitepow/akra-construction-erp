import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ContractPaperExternal = sequelize.define('ContractPaperExternal', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  paperId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  fileName: {
    type: DataTypes.STRING(150),
    allowNull: false,
  },
  editorContentHtml: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  paperSetting: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
});

export default ContractPaperExternal;
