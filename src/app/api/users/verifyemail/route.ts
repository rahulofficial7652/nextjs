import { connect } from "@/configdb/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token, id } = await reqBody;
        console.log(reqBody);
        const user = await User.findById(id);
        if (!user) {
            return NextResponse.json({ message: "User does not exist" }, { status: 400 });
        }
        if (user.verifyToken !== token || user.verifyTokenExpiry < Date.now()) {
            return NextResponse.json({ message: "Token is invalid or has expired" }, { status: 400 });
        }
        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();
        return NextResponse.json({ message: "Email verified successfully", success: true }, { status: 200 });
    } catch (error:any) {
        return NextResponse.json({ message: error.message }, { status: 500 });        
    }
}