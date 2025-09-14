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
        order_status: {
            type: DataTypes.STRING,
            defaultValue: 'Pending'
        },
    },
);

export { Orders };
