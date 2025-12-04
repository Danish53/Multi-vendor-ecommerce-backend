import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

export const Ads = sequelize.define("ads", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  vendor_id: DataTypes.INTEGER,
  product_id: DataTypes.INTEGER,
  ad_text: DataTypes.STRING,
});
