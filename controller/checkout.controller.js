import bcrypt from "bcryptjs";
import { sendToken } from "../utils/jwtToken.js";
import { Users } from "../model/user.model.js";
import { Orders } from "../model/orders.model.js";
import { OrderItems } from "../model/orderItems.model.js";
import { asyncErrors } from "../middleware/asyncErrors.js";
import jwt from "jsonwebtoken";
import axios from "axios";

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

    const paymentType = payment_method?.toLowerCase();

    // // -------- COD extra charges --------
    // if (paymentType === "COD") {
    //     total_amount += 50; // Add extra 50 rupees for COD
    // }


    // -------- Order Create --------
    // add 50 rupee total amount
    const order = await Orders.create({
        user_id: user.id,
        total_amount: total_amount += 50,
        admin_commission,
        payment_method: paymentType,
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

    // -------- Safepay Payment Intent --------
    if (paymentType === "safepay") {
        console.log("Safepay branch executing...");
        try {
            const paymentResponse = await axios.post(
                `https://sandbox.api.getsafepay.com/order/v1/init`,
                {
                    amount: total_amount * 100,
                    currency: "PKR",
                    intent: "sale",
                    order_id: order.id.toString(),
                    redirect_url: `${process.env.FRONTEND_URL}order/success`,
                    cancel_url: `${process.env.FRONTEND_URL}order/cancel`,
                    environment: "sandbox",
                    client: process.env.SAFEPAY_PUBLIC_KEY,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.SAFEPAY_SECRET_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );
            console.log(paymentResponse, "payment res....")

            const paymentLink = `${process.env.SAFEPAY_URL_SAND.replace(
                "api.",
                ""
            )}/checkout/${paymentResponse.data.data.token}`;

            return res.status(200).json({
                success: true,
                message: "Order created and payment link generated",
                payment_link: paymentLink,
                order,
                token: token || null,
            });
        } catch (err) {
            console.error("Safepay Error:", err.response?.data || err.message);
            return res.status(500).json({
                success: false,
                message: "Payment initiation failed",
                error: err.message,
            });
        }
    }


    res.status(200).json({
        success: true,
        message: "Order created successfully",
        token: token || null,
        order,
        order_items: orderItemsData,
    });
}); 



