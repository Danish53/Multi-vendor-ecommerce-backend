import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

const Orders = sequelize.define(
  "orders",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    admin_commission: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    payment_method: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    shipping_address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    // =============================
    // MAIN STATUS: Pending, Cancelled,
    // Delivered, Return Requested,
    // Refund Requested, Claim Requested
    // =============================
    order_status: {
      type: DataTypes.STRING,
      defaultValue: "Pending",
    },

    // ⭐ User cancel/return/refund/claim reason
    user_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // ⭐ Admin approve/reject comment
    admin_response: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // (Optional but very useful)
    claim_images: {
      type: DataTypes.JSON, // array of images
      allowNull: true,
    },

    return_accepted_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    refund_approved_date: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export { Orders };
