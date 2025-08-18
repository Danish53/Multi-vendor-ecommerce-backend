import { sequelize } from "../database/dbConnection.js";
import "../model/index.js";

export const syncAllTables = async (req, res) => {
  try {

    await sequelize.sync({ alter: true });

    res.status(200).json({ message: "All tables synchronized successfully!" });
  } catch (err) {
    res
      .status(500)
      .json({ error: `Failed to synchronize tables: ${err.message}` });
  }
};
