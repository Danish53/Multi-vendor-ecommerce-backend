// Using Sequelize ORM example (MySQL / MariaDB)
import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

export const VendorPlanRequest = sequelize.define("vendor_plan_requests", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  vendor_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  plan_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  receipt_image: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending",
  },
});
