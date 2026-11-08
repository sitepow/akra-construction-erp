import { DataTypes } from 'sequelize';
import sequelize from '@/database/config';

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  companies: {
    type: DataTypes.JSON(),
    allowNull: true,
  },
  permissionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  prefix: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  employeeType: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  salary: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  firstname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  lastname: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fullAddress: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  district: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  subDistrict: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  province: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  zipcode: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  telephone: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  nationalId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  birthday: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  fullBank: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankName: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankBranch: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankType: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },
  bankAccount: {
    type: DataTypes.STRING(150),
    allowNull: true,
  },

  socialSecurityNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  employmentStatus: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  jobTitle: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  healthConditions: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  allergies: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  educationLevel: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  institutionName: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  graduationYear: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  workPermitNumber: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  visaType: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  visaExpiryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  hospital: {
    type: DataTypes.STRING(655),
    allowNull: true,
  },
});

export default Employee;
