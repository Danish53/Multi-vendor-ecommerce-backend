import { DataTypes } from "sequelize";
import { Users } from "./user.model.js";
import { sequelize } from "../database/dbConnection.js";

export const Messages = sequelize.define(
  "messages",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },

    receiver_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
        key: "id",
      },
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    timestamps: true,
  }
);

// ============== RELATIONSHIPS ==============
Users.hasMany(Messages, { foreignKey: "sender_id", as: "sentMessages" });
Users.hasMany(Messages, { foreignKey: "receiver_id", as: "receivedMessages" });

Messages.belongsTo(Users, { foreignKey: "sender_id", as: "sender" });
Messages.belongsTo(Users, { foreignKey: "receiver_id", as: "receiver" });
