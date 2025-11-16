import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import { Transporter } from "nodemailer";

export const sendEmail = async ({ email, emailType, userId }: any) => {
    try {
        const hashedToken = await bcrypt
            .hash(userId.toString(), 10)
            .then(async (hashedToken) => { });

        if (emailType === "VERIFY") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000,
            });
            //for 1 hour
        } else if (emailType === "RESET") {
            await User.findByIdAndUpdate(userId, {
                verifyToken: hashedToken,
                verifyTokenExpiry: Date.now() + 3600000,
            });
        }

        // Looking to send emails in production? Check out our Email API/SMTP product!
        var transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
                user: "fdbe0b3240c9f8", //❌
                pass: "146876b51e06c9", //❌
            },
        });

        const mailOptions = {
            from: "rahulmaurya7652@gmail.com",
            to: email,
            subject:
            emailType === "VERIFY" ? "Verify your email" : "Reset your password",
            html: `<p>`
        };

        const mailResponse = await transport.sendMail(mailOptions);
        return mailResponse;
    } catch (error: any) {
        throw new Error(error.message);
    }
};
