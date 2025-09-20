import { sequelize } from "../database/dbConnection.js";
import { Categories } from "./category.model.js";
import { Products } from "./product.model.js";
import { ProductImages } from "./productImages.model.js";
import { Users } from "./user.model.js";

Products.hasMany(ProductImages, {
    foreignKey: "product_id",
    as: "gallery_images",
    onDelete: "CASCADE",
});
ProductImages.belongsTo(Products, { foreignKey: "product_id" });


Categories.hasMany(Products, {
    foreignKey: "category_id",
    as: "products",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});
Products.belongsTo(Categories, {
    foreignKey: "category_id",
    as: "category",   // singular (fix)
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Users.hasMany(Products, {
    foreignKey: "vendor_id",
    as: "products",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

// 1 Product → Belongs to 1 User
Products.belongsTo(Users, {
    foreignKey: "vendor_id",
    as: "user",   // 👈 same "as" jo aap include me use kar rahe ho
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});


export { sequelize };
