import { sequelize } from "../database/dbConnection.js";
import { Ads } from "./ads.model.js";
import { Categories } from "./category.model.js";
import { OrderItems } from "./orderItems.model.js";
import { Orders } from "./orders.model.js";
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

Orders.hasMany(OrderItems, {
    foreignKey: "order_id",
    as: "items",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

OrderItems.belongsTo(Orders, {
    foreignKey: "order_id",
    as: "order",
    onDelete: "CASCADE",
    onUpdate: "CASCADE"
});

Users.hasMany(Orders, { foreignKey: "user_id", as: "orders" }); // customer side
Orders.belongsTo(Users, { foreignKey: "user_id", as: "customer" });

Products.hasMany(OrderItems, { foreignKey: "product_id", as: "orderItems" });
OrderItems.belongsTo(Products, { foreignKey: "product_id", as: "product" });

Ads.belongsTo(Products, { foreignKey: "product_id" });
Products.hasMany(Ads, { foreignKey: "product_id" });




export { sequelize };
