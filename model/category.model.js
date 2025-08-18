import { DataTypes } from "sequelize";
import { sequelize } from "../database/dbConnection.js";
import slugify from "slugify";

const Categories = sequelize.define(
    "categories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        category_image: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
    },
    {
        hooks: {
            beforeValidate: (category) => {
                if (category.name) {
                    category.slug = slugify(category.name, {
                        lower: true,
                        strict: true,
                    });
                }
            },
        },
    }
);



export { Categories }