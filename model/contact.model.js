import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

const Contact = sequelize.define(
    "Contact",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
    {
        tableName: "contacts",
        timestamps: true,
    }
);

export { Contact }
