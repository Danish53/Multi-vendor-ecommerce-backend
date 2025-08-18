// controllers/productController.js
import { Products } from "../model/product.model.js";
import { asyncErrors } from "../middleware/asyncErrors.js";
import ErrorHandler from "../middleware/error.js";
import { ProductImages } from "../model/productImages.model.js";
import { Categories } from "../model/category.model.js";

// products
export const addProduct = asyncErrors(async (req, res, next) => {
    const { category_name, name, discount_price, description, price, stock } = req.body;
    const vendor_id = req.user.id;

    const product_image = req.files?.product_image?.[0];
    const gallery_images = req.files?.gallery_images || [];

    if (!category_name || !name || !discount_price || !stock || !description || !price) {
        return next(new ErrorHandler("Please fill all required fields!", 400));
    }

    if (!product_image) {
        return next(new ErrorHandler("Please upload a main product image!", 400));
    }

    if (gallery_images.length === 0) {
        return next(new ErrorHandler("Please upload gallery images!", 400));
    }

    const category = await Categories.findOne({ where: { name: category_name } });

    if (!category) {
        return next(new ErrorHandler("Invalid category!", 400));
    }

    // Save product
    const product = await Products.create({
        product_image: product_image.filename,
        name,
        description,
        price,
        discount_price,
        stock,
        vendor_id,
        category_name,
        category_id: category.id,
        status: "approved",
    });

    // Save gallery images
    const imagePromises = gallery_images.map((file) => {
        return ProductImages.create({
            product_id: product.id,
            gallery_images: file.filename,
        });
    });

    await Promise.all(imagePromises);

    // const admin = await Users.findOne({ where: { role: "admin" } });
    // if (admin?.email) {
    //     await sendMail({
    //         to: admin.email,
    //         subject: "New Product Added - Approval Required",
    //         html: `
    //             <h3>New Product Submitted for Approval</h3>
    //             <p><strong>Title:</strong> ${name}</p>
    //             <p><strong>Price:</strong> $${price}</p>
    //             <p><strong>Vendor ID:</strong> ${vendor_id}</p>
    //             <p>Please review and approve/reject the product in the admin panel.</p>
    //         `,
    //         from: `"Vendor Product Approval" <${process.env.EMAIL_USER}>`
    //     });
    // }

    res.status(200).json({
        success: true,
        message: "Product added successfully!",
        product
    });
});
export const updateProduct = asyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const vendor_id = req.user.id;
    const { category_name, name, discount_price, description, price, stock } = req.body;

    const product = await Products.findOne({ where: { id: productId, vendor_id } });

    if (!product) {
        return next(new ErrorHandler("Product not found or not authorized", 404));
    }

    const product_image = req.files?.product_image?.[0];
    const gallery_images = req.files?.gallery_images || [];

    const category = await Categories.findOne({ where: { name: category_name } });

    if (!category) {
        return next(new ErrorHandler("Invalid category!", 400));
    }

    // Update product fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discount_price = discount_price || product.discount_price;
    product.stock = stock || product.stock;
    product.category_name = category_name || product.category_name;
    product.category_id = category.id;

    if (product_image) {
        product.product_image = product_image.filename;
    }

    await product.save();

    if (gallery_images.length > 0) {
        await ProductImages.destroy({ where: { product_id: product.id } });

        const imagePromises = gallery_images.map((file) => {
            return ProductImages.create({
                product_id: product.id,
                gallery_images: file.filename,
            });
        });

        await Promise.all(imagePromises);
    }

    const updatedProduct = await Products.findOne({
        where: { id: product.id },
        include: [
            {
                model: ProductImages,
                as: "gallery_images",
                attributes: ["id", "gallery_images"],
            },
        ],
    });

    const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

    res.status(200).json({
        success: true,
        message: "Product updated successfully!",
        product: {
            ...updatedProduct.toJSON(),
            product_image: updatedProduct.product_image
                ? baseUrl + updatedProduct.product_image
                : null,
            gallery_images: updatedProduct.gallery_images.map((img) => baseUrl + img.gallery_images),
        },
    });
});
export const getVendorProducts = asyncErrors(async (req, res, next) => {
    const vendor_id = req.user.id;

    const products = await Products.findAll({
        where: { vendor_id },
        include: [
            {
                model: ProductImages,
                as: "gallery_images",
                attributes: ["id", "gallery_images"],
            },
        ],
    });

    if (!products || products.length === 0) {
        return next(new ErrorHandler("No products found for this vendor!", 404));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

    // Format response
    const formattedProducts = products.map((product) => {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            discount_price: product.discount_price,
            stock: product.stock,
            category_name: product.category_name,
            status: product.status,
            rating: product.rating,
            is_like: product.is_like,
            vendor_id: product.vendor_id,
            category_id: product.category_id,
            product_image: product.product_image
                ? baseUrl + product.product_image
                : null,
            gallery_images: product.gallery_images
                ?.filter((img) => img.gallery_images)
                .map((img) => baseUrl + img.gallery_images),
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
        };
    });

    res.status(200).json({
        success: true,
        count: formattedProducts.length,
        products: formattedProducts,
    });
});
export const deleteVendorProduct = asyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const vendorId = req.user.id;

    try {
        const deletedProduct = await Products.findOne({
            where: { id: productId, vendor_id: vendorId },
        });

        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        await ProductImages.destroy({
            where: { product_id: productId },
        });

        await deletedProduct.destroy();

        return res.status(200).json({ message: "Product and gallery images deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Something went wrong" });
    }
});
export const getSingleProduct = asyncErrors(async (req, res, next) => {
    const { productId } = req.params;
    const vendor_id = req.user.id;

    const product = await Products.findOne({
        where: { id: productId, vendor_id },
        include: [
            {
                model: ProductImages,
                as: "gallery_images",
                attributes: ["id", "gallery_images"],
            },
        ],
    });

    if (!product) {
        return next(new ErrorHandler("Product not found!", 404));
    }

    const baseUrl = `${req.protocol}://${req.get("host")}/assets/`;

    const formattedProduct = {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        discount_price: product.discount_price,
        stock: product.stock,
        category_name: product.category_name,
        status: product.status,
        rating: product.rating,
        is_like: product.is_like,
        vendor_id: product.vendor_id,
        product_image: product.product_image
            ? baseUrl + product.product_image
            : null,
        gallery_images: product.gallery_images
            ?.filter((img) => img.gallery_images)
            .map((img) => baseUrl + img.gallery_images),
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
    };

    res.status(200).json({
        success: true,
        product: formattedProduct,
    });
});




