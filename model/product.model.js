// models/product.model.js
import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";

const Products = sequelize.define("products", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    vendor_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    category_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sub_category_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    product_image: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    discount_price: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    stock: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    product_status: {
        type: DataTypes.ENUM("pending", "approved", "rejected"),
        defaultValue: "approved",
    },
    rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
    },
    is_like: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "categories",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    isPopular: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isFeature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
});


export { Products };
