import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";
import { Products } from "./product.model.js";

const ProductImages = sequelize.define("productImages", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    gallery_images: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "product_images",
    timestamps: true,
});

// Associations
ProductImages.belongsTo(Products, {
    foreignKey: "product_id",
    as: "product",
});
Products.hasMany(ProductImages, {
    foreignKey: "product_id",
    as: "images",
});

export { ProductImages };
