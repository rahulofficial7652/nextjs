import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";
import crypto from "crypto";

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        // Generate a secure random token, store a hashed version in DB and send the plain token in email
        const token = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(token, 10);

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, {
                $set : {
                    verifyToken: hashedToken,
                    verifyTokenExpiry: Date.now() + 3600000,
                }
            });
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, {
               $set:{
                 resetPasswordToken: hashedToken,
                resetPasswordTokenExpiry: Date.now() + 3600000,
               }
            });
        }

        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "fdbe0b3240c9f8",
                pass: "146876b51e06c9",
            },
        });

        const mailOptions = {
            from: "rahulmaurya7652@gmail.com",
            to: email,
            subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            // encode token for URL safety and send the plain token (not the hashed version)
            html: `<p> Click <a href="${process.env.DOMAIN}/verifyemail?token=${encodeURIComponent(token)}&id=${userId}">here</a> to ${emailType === "VERIFY" ? "verify your email" : "reset your password"} or copy and paste the link below in your browser. <br> ${process.env.DOMAIN}/verifyemail?token=${encodeURIComponent(token)}&id=${userId}</p>`,
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;
    } catch (error: any) {
        throw new Error(error.message);
    }
};