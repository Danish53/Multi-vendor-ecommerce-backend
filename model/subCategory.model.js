import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";
import { Categories } from "./category.model.js";

const SubCategories = sequelize.define(
    "subCategories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: Categories,
                key: "id",
            },
        },
    },
);

SubCategories.belongsTo(Categories, { foreignKey: "category_id" });
Categories.hasMany(SubCategories, { foreignKey: "category_id" });

export { SubCategories }