import { connect } from "@/configdb/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";
import jwt from "jsonwebtoken";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { email, password } = reqBody;

        // Validation
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        //if user matched, compare password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }
        if (!user.isVerified) {
            await sendEmail({ email, emailType: "VERIFY", userId: user._id });
            return NextResponse.json(
                {
                    message:
                        "Email not verified. A new verification email has been sent.",
                },
                { status: 400 }
            );
        }
        const tokenData = {
            id: user._id,
            username: user.username,
            email: user.email,
        };
        const token = await jwt.sign(tokenData, process.env.JWT_TOKEN_SECRET!, {
            expiresIn: "1d",
        });
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            token,
        });

        response.cookies.set("token", token, {
            httpOnly: true,
        });
        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
