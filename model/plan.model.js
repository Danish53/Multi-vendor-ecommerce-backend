import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";


const Plan = sequelize.define("Plan", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    duration_days: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    placement: {
        type: DataTypes.ENUM("diamond", "sponsored", "basic"),
        defaultValue: "basic",
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
});

export { Plan };
