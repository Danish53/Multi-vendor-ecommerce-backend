import { col, fn, Op } from "sequelize";
import { asyncErrors } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Categories } from "../model/category.model.js";
import { Products } from "../model/product.model.js";
import { Users } from "../model/user.model.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendMail } from "../utils/sendMail.js";

// Auth User
export const register = asyncErrors(async (req, res, next) => {
    const {
        user_name,
        email,
        password,
        confirm_password,
        role,
        shop_name,
        phone,
        address,
        payment_method,
        payment_details,
        bank_name
    } = req.body;

    console.log(req.body, "body")

    const business_license = req.file ? req.file.filename : null;

    if (!user_name || !email || !phone || !password || !confirm_password || !role) {
        return next(new ErrorHandler("Please fill all required fields!", 400));
    }

    if (!["user", "vendor"].includes(role)) {
        return next(new ErrorHandler("Invalid role! Role must be 'user' or 'vendor'", 400));
    }

    if (user_name.length < 3) {
        return next(new ErrorHandler("Username must contain at least 3 characters!", 400));
    }

    if (password !== confirm_password) {
        return next(new ErrorHandler("Passwords do not match!", 400));
    }

    if (role === "vendor" && (!shop_name || !business_license || !address)) {
        return next(new ErrorHandler("Vendor must provide shop_name, business_license, and address!", 400));
    }

    if (role === "vendor" && (!payment_method || !payment_details)) {
        return next(new ErrorHandler("Vendor must provide payment method and payment details!", 400));
    }

    if (role === "vendor" && payment_method === "Bank" && !bank_name) {
        return next(new ErrorHandler("Vendor must provide bank_name if payment method is Bank!", 400));
    }

    try {
        // Check for duplicates
        const [userEmail, userName] = await Promise.all([
            Users.findOne({ where: { email } }),
            Users.findOne({ where: { user_name } })
        ]);

        if (userEmail || userName) {
            return next(new ErrorHandler("User already exists!", 400));
        }

        // Create user/vendor
        const user = await Users.create({
            user_name,
            email,
            password,
            role,
            shop_name: role === "vendor" ? shop_name : null,
            phone: phone || null,
            address: role === "vendor" ? address : null,
            business_license: role === "vendor" ? business_license : null,
            payment_method: role === "vendor" ? payment_method : null,
            payment_details: role === "vendor" ? payment_details : null,
            bank_name: role === "vendor" && payment_method === "Bank" ? bank_name : null,
            is_approved: role === "vendor" ? 0 : 1
        });

        if (role === "vendor") {
            const adminUser = await Users.findOne({
                where: { role: "admin" },
                attributes: ["email"],
                raw: true
            });
            console.log(adminUser.email, "admin email");

            if (adminUser?.email) {
                await sendMail({
                    to: adminUser.email,
                    subject: "New Vendor Registration",
                    html: `
                <h3>New Vendor Registered</h3>
                <p><strong>Name:</strong> ${user_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Shop Name:</strong> ${shop_name}</p>
                <p><strong>payment Method:</strong> ${payment_method}</p>
                <p><strong>Account Number:</strong> ${payment_details}</p>
                ${payment_method === "Bank" ? `<p><strong>Bank Name:</strong> ${bank_name}</p>` : ""}
            `,
                });
            }
        }

        sendToken(user, 200, `${role} registered successfully! ${role === "vendor" ? "Your Detail has been sent to admin. Please wait for approval before login." : ""}`, res);
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});
export const login = asyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please enter both email and password", 400));
    }

    const user = await Users.findOne({ where: { email } });

    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    if (user.role === "vendor") {
        if (user.is_approved === 0) {
            return next(new ErrorHandler("Your account is pending approval by admin.", 403));
        }
        if (user.is_approved === 2) {
            return next(new ErrorHandler("Your account was rejected by admin.", 403));
        }
    }

    if (user.deleted_at) {
        return res.status(400).json({
            success: false,
            message: "Your account has been deactivated. Please contact support."
        });
    }


    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    const userData = {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        shop_name: user.shop_name,
        shop_logo: user.shop_logo,
        profileAvatar: user.profileAvatar,
        address: user.address,
        is_approved: user.is_approved,
        business_license: user.business_license,
        payment_method: user.payment_method,
        payment_details: user.payment_details,
        bank_name: user.bank_name,
    };

    sendToken(userData, 200, `${user.role} logged in successfully!`, res);
});
export const updateProfile = asyncErrors(async (req, res, next) => {
    const { id } = req.user;
    const user = await Users.findOne({ where: { id } });

    if (!user) return next(new ErrorHandler("User not found", 404));

    const {
        user_name,
        email,
        phone,
        shop_name,
        address,
        password,
    } = req.body;

    const files = req.files;
    const profileAvatar = files?.profileAvatar?.[0]?.filename;
    const shop_logo = files?.shop_logo?.[0]?.filename;
    // const business_license = files?.business_license?.[0]?.filename;

    user.user_name = user_name || user.user_name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.password = password || user.password;
    if (profileAvatar) user.profileAvatar = profileAvatar;

    if (user.role === "vendor") {
        user.shop_name = shop_name || user.shop_name;
        user.address = address || user.address;
        if (shop_logo) user.shop_logo = shop_logo;
        // if (business_license) user.business_license = business_license;
    }

    await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    });
});
export const getProfile = asyncErrors(async (req, res, next) => {
    const { id } = req.user;
    const user = await Users.findOne({
        where: { id },
        attributes: {
            exclude: ["password", "otp"]
        }
    });

    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

    // agar profileAvatar aur licenseImage fields hain to unka full URL bana lo
    const userData = {
        ...user.toJSON(),
        profileAvatar: user.profileAvatar ? baseUrl + user.profileAvatar : null,
        business_license: user.business_license ? baseUrl + user.business_license : null
    };

    res.status(200).json({
        success: true,
        user: userData,
    });
});

// all Categories
export const getAllCategories = async (req, res) => {
    try {
        const category = await Categories.findAll({
            order: [["id", "DESC"]],
        });
        res.status(200).json({ success: "true", category: category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// products with filter
export const getAllProductsFilters = asyncErrors(async (req, res, next) => {
    try {
        const { category_slug, minPrice, maxPrice } = req.query;

        let whereClause = {};

        // price filter
        if (minPrice && maxPrice) {
            whereClause.price = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
        } else if (minPrice) {
            whereClause.price = { [Op.gte]: parseFloat(minPrice) };
        } else if (maxPrice) {
            whereClause.price = { [Op.lte]: parseFloat(maxPrice) };
        }

        // ✅ Category filter
        let includeClause = [];
        if (category_slug) {
            includeClause.push({
                model: Categories,
                as: "category",
                where: { slug: category_slug },
                attributes: ["id", "name", "slug"],
            });
        } else {
            includeClause.push({
                model: Categories,
                as: "category",
                attributes: ["id", "name", "slug"],
            });
        }

        const products = await Products.findAll({
            where: whereClause,
            include: includeClause,
            attributes: ["id", "name", "price", "description", "product_image", "discount_price", "vendor_id", "product_status", "stock", "rating", "is_like"],
        });

        const plainProducts = products.map((p) => p.toJSON());
        // const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;
        const baseUrl = process.env.BASE_URL
            ? `${process.env.BASE_URL}/assets/`
            : `${req.protocol}://${req.get("host")}/assets/`;
            console.log(baseUrl, "env log.......")
        // const baseUrl = `${process.env.BASE_URL}/assets/`;
        const productsWithUrl = plainProducts.map((p) => ({
            ...p,
            product_image: p.product_image ? baseUrl + p.product_image : null,
        }));

        const productsTotal = await Products.findAll({
            attributes: [
                [fn("MIN", col("price")), "minPrice"],
                [fn("MAX", col("price")), "maxPrice"],
            ],
            raw: true,
        });

        const totalCount = await Products.count();

        res.status(200).json({
            success: true,
            filter_product_count: productsWithUrl.length,
            totalProducts: totalCount,
            min_price: productsTotal[0].minPrice,
            max_price: productsTotal[0].maxPrice,
            products: productsWithUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
export const getProductDetail = async (req, res, next) => {
    const { productId } = req.params;
    try {
        const product = await Products.findOne({
            where: { id: productId }
        });

        if (!product) {
            return next(new ErrorHandler("product not found!", 404))
        }

        const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;
        // const baseUrl = `${process.env.BASE_URL}/assets/`;
        const productWithImageUrl = {
            ...product.toJSON(),
            product_image: `${baseUrl}${product.product_image}`
        };

        res.status(200).json({ success: true, product: productWithImageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// popular products
export const getPopularProducts = async (req, res) => {
    try {
        const popular = await Products.findAll({
            where: { isPopular: true }
        });

        const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;
        // const baseUrl = `${process.env.BASE_URL}/assets/`;
        const productsWithUrls = popular.map(product => {
            return {
                ...product.dataValues,
                product_image: product.product_image ? baseUrl + product.product_image : null
            };
        });

        res.status(200).json({ success: true, products: productsWithUrls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// popular products
export const getFeaturedProducts = async (req, res) => {
    try {
        const feature = await Products.findAll({
            where: { isFeature: true }
        });

        const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;
        // const baseUrl = `${process.env.BASE_URL}/assets/`;

        const productsWithUrls = feature.map(product => {
            return {
                ...product.dataValues,
                product_image: product.product_image ? baseUrl + product.product_image : null
            };
        });


        res.status(200).json({ success: true, products: productsWithUrls });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// checkout






