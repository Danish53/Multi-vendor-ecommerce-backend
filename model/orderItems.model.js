import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

const OrderItems = sequelize.define(
  "order_items",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    vendor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    vendor_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    admin_commission: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    order_status: {
      type: DataTypes.STRING,
      defaultValue: "Pending", // Pending, Shipped, Delivered, Cancelled
    },
  },
  {
    timestamps: true,
  }
);

export { OrderItems };
