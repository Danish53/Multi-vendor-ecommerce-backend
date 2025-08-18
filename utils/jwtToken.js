// export const sendToken = (user, statusCode, message, res) => {
//     const token = user.getJWTToken();
//     const options = {
//       expires: new Date(
//         Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
//       ),
//       httpOnly: true,
//     };
//     res.status(statusCode).cookie("token", token, options).json({
//       success: true,
//       user,
//       message,
//       token,
//     });
//   };


import jwt from "jsonwebtoken";

export const sendToken = (user, statusCode, message, res) => {
    const token =
        typeof user.getJWTToken === "function"
            ? user.getJWTToken()
            : jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET_KEY,
                { expiresIn: process.env.EXPIRES_jWT || "1d" }
            );

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
    };

    res.status(statusCode).cookie("token", token, options).json({
        success: true,
        user,
        message,
        token,
    });
};
