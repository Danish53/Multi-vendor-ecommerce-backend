// import { sequelize } from "../database/dbConnection.js";
// import "../model/index.js";

// export const syncAllTables = async (req, res) => {
//   try {

//     await sequelize.sync({ alter: true });

//     res.status(200).json({ message: "All tables synchronized successfully!" });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ error: `Failed to synchronize tables: ${err.message}` });
//   }
// };

// src/controllers/syncTables.controller.js
import { sequelize } from "../database/dbConnection.js";
import { Users } from "../model/user.model.js";
import { Categories } from "../model/category.model.js";
import { Products } from "../model/product.model.js";
import { ProductImages } from "../model/productImages.model.js";
import { Orders } from "../model/orders.model.js";
import { OrderItems } from "../model/orderItems.model.js";
import "../model/index.js";
import { Contact } from "../model/contact.model.js";
import { Plan } from "../model/plan.model.js";
import { VendorPlanRequest } from "../model/vendorPlan.model.js";
import { Ads } from "../model/ads.model.js";

/**
 * Sequentially sync all tables to avoid foreign key issues
 */
export const syncAllTables = async (req, res) => {
  try {
    // Parent tables first
    await Users.sync({ alter: true });
    await Categories.sync({ alter: true });

    // Dependent tables
    await Products.sync({ alter: true });
    await ProductImages.sync({ alter: true });
    await Orders.sync({ alter: true });
    await OrderItems.sync({ alter: true });
    await Contact.sync({ alter: true });
    await Plan.sync({ alter: true });
    await VendorPlanRequest.sync({ alter: true });
    await Ads.sync({ alter: true });


    res.status(200).json({ message: "All tables synchronized successfully!" });
  } catch (err) {
    console.error("Sync error:", err);
    res.status(500).json({
      error: `Failed to synchronize tables: ${err.message}`,
    });
  }
};
