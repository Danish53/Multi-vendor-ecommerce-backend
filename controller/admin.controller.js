import bcrypt from "bcryptjs";
import { asyncErrors } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { Users } from "../model/user.model.js";
import { sendToken } from "../utils/jwtToken.js";
import { sendMail } from "../utils/sendMail.js";
import { Categories } from "../model/category.model.js";

// Auth admin
export const adminLogin = asyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorHandler("Please provide email and password", 400));
    }

    const user = await Users.findOne({ where: { email } });

    if (!user || user.role !== "admin") {
        return next(new ErrorHandler("Invalid email or not authorized as admin", 401));
    }

    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    sendToken(user, 200, "Admin logged in successfully", res);
});
export const getAdminProfile = asyncErrors(async (req, res, next) => {
    const admin = await Users.findOne({
        where: { id: req.user.id, role: "admin" },
        attributes: { exclude: ["password", "otp"] }
    });

    if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    res.status(200).json({
        success: true,
        user: admin,
    });
});
export const updateAdminProfile = asyncErrors(async (req, res, next) => {
    const admin = await Users.findOne({ where: { id: req.user.id, role: "admin" } });

    if (!admin) {
        return next(new ErrorHandler("Admin not found", 404));
    }

    const {
        user_name,
        email,
        phone,
        password,
    } = req.body;

    // const profileAvatar = req.file?.filename;
    const profileAvatar = req.file?.filename;
    if (profileAvatar) admin.profileAvatar = profileAvatar;


    admin.user_name = user_name || admin.user_name;
    admin.email = email || admin.email;
    admin.phone = phone || admin.phone;
    admin.profileAvatar = profileAvatar || admin.profileAvatar;

    // Optional password change
    if (password) {
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();

    res.status(200).json({
        success: true,
        message: "Admin profile updated successfully",
        user: admin,
    });
});

// approved/reject
export const updateVendorStatus = async (req, res, next) => {
    const { vendorId, status } = req.body;

    try {
        const vendor = await Users.findByPk(vendorId);
        if (!vendor) return next(new ErrorHandler("Vendor not found", 404));

        vendor.is_approved = status;
        await vendor.save();

        let subject = "";
        let html = "";

        if (status === 1) {
            subject = "Your Vendor Account is Approved!";
            html = `<h3>Dear ${vendor.user_name},</h3><p>Your vendor account has been <strong>approved</strong>. You can now login and use the Website.</p>`;
        } else if (status === 2) {
            subject = "Your Vendor Account is Rejected";
            html = `<h3>Dear ${vendor.user_name},</h3><p>We regret to inform you that your vendor account has been <strong>rejected</strong>. Please contact support for more information.</p>`;
        }

        await sendMail({
            to: vendor.email,
            subject,
            html,
        });

        return res.status(200).json({ message: `Vendor ${status === 1 ? "Approved" : status === 2 ? "Reject" : ""} and email sent.`, user: vendor });
    } catch (error) {
        console.error("Vendor update error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

// category/subcategory
export const createCategory = asyncErrors(async (req, res, next) => {
    const { name } = req.body;
    if (!name) {
        return next(new ErrorHandler("Category name is required!", 404))
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

    let imagePath = null;
    if (req.file) {
        imagePath = `${baseUrl}${req.file.filename}`;
    }

    const category = await Categories.create({
        name,
        category_image: imagePath
    });

    res.status(200).json({ success: true, message: "Category created", category });
});
export const getAllCategories = async (req, res) => {
    try {
        const category = await Categories.findAll();
        res.status(200).json({ success: "true", category: category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const updateCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const { name } = req.body;
        if (!name) {
            return next(new ErrorHandler("Category name required!", 404))
        }
        const category = await Categories.findByPk(id);
        if (!category) return res.status(404).json({ message: "category Not found" });

        const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

        let imagePath = null;
        if (req.file) {
            imagePath = `${baseUrl}${req.file.filename}`;
        }

        await category.update({ name, category_image: imagePath });
        res.status(200).json({ success: true, message: "Category Updated successfull!", category });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        const category = await Categories.findByPk(id);
        if (!category) return res.status(404).json({ message: "category Not found" });

        await category.destroy();
        res.status(200).json({ success: "true", message: "Category Deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



