import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sequelize } from "../database/dbConnection.js";

const Users = sequelize.define(
    "users",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        role: {
            type: DataTypes.ENUM("admin", "user", "vendor"),
            allowNull: false,
            defaultValue: "user",
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phone: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shop_name: {
            type: DataTypes.STRING,
        },
        shop_logo: {
            type: DataTypes.STRING,
        },
        profileAvatar: {
            type: DataTypes.STRING,
        },
        address: {
            type: DataTypes.STRING,
        },
        otp: {
            type: DataTypes.STRING,
        },
        is_approved: {
            type: DataTypes.BIGINT,
        },
        business_license: {
            type: DataTypes.STRING,
        },
    },

    {
        hooks: {
            beforeCreate: async (user) => {
                if (user.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);
                }
            },
            beforeUpdate: async (user) => {
                if (user.password && user.changed("password")) {
                    if (user.role !== "admin") {
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                    }
                }
            },
        },
        timestamps: true,
        indexes: [],
    }
);

Users.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

Users.prototype.getJWTToken = function () {
    return jwt.sign(
        { id: this.id, email: this.email },
        process.env.JWT_SECRET_KEY,
        {
            expiresIn: process.env.EXPIRES_jWT || "1d",
        }
    );
};

export { Users };
