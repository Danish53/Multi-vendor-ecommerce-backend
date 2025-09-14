import bcrypt from "bcryptjs";
import { sendToken } from "../utils/jwtToken.js";
import { Users } from "../model/user.model.js";
import { Orders } from "../model/orders.model.js";
import { OrderItems } from "../model/orderItems.model.js";
import { asyncErrors } from "../middleware/asyncErrors.js";
import jwt from "jsonwebtoken";

export const checkout = asyncErrors(async (req, res, next) => {
    const { user_id, email, password, cart, shipping_address, payment_method } = req.body;

    if (!cart || cart.length === 0) {
        return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let user = null;
    let token = null;

    // -------- User Handling --------
    if (user_id) {
        user = await Users.findOne({ where: { id: user_id } });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } else {
        if (!email || !password) {
            return res
                .status(400)
                .json({ success: false, message: "Email and password are required" });
        }

        user = await Users.findOne({ where: { email } });

        if (user) {
            // Login check
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: "Invalid credentials" });
            }
        } else {
            // Register
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await Users.create({
                email,
                password: hashedPassword,
                user_name: email.split("@")[0],
                role: "user",
            });
        }

        // JWT Token Generate
        token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });
    }

    // -------- Order Calculation --------
    let total_amount = 0;
    let admin_commission = 0;

    const orderItemsData = cart.map((item) => {
        const itemTotal = item.price * item.quantity;

        const commission = (itemTotal * 5) / 100; // 5% admin commission
        const vendor_amount = itemTotal - commission;

        total_amount += itemTotal;
        admin_commission += commission;

        return {
            product_id: item.id,
            quantity: item.quantity,
            price: item.price,
            vendor_id: item.vendor_id,
            vendor_amount,
            admin_commission: commission
        };
    });

    // -------- Order Create --------
    const order = await Orders.create({
        user_id: user.id,
        total_amount,
        admin_commission,
        payment_method,
        shipping_address,
        order_status: "Pending",
    });

    // -------- Order Items Create --------
    for (let item of orderItemsData) {
        await OrderItems.create({
            order_id: order.id,
            ...item,
        });
    }

    res.status(200).json({
        success: true,
        message: "Order created successfully",
        token: token || null,
        order,
        order_items: orderItemsData,
    });
});

