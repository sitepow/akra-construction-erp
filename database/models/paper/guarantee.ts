import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const ProjectGuaranteeSlip = sequelize.define('ProjectGuaranteeSlip', {
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
  guaranteeSlipNo: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  guaranteeSlipNumber: {
    type: DataTypes.STRING(155),
    allowNull: true,
  },
  paidGuaranteeDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(155),
    allowNull: false,
    defaultValue: 'pending',
  },
});

export default ProjectGuaranteeSlip;
