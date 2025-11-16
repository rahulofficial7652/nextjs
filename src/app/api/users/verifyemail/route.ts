import {connect} from "@/configdb/dbConfig";
import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";

connect();

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json();
        // support receiving token and id from the client
        const { token, id } = reqBody;
        console.log("verify token:,", token, "id:", id);

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        let user = null;
        if (id) {
            user = await User.findById(id);
        } else {
            // fallback: find any user that still has a valid verifyTokenExpiry
            user = await User.findOne({ verifyTokenExpiry: { $gt: Date.now() } });
        }

        if (!user) {
            console.log("user not found for id or expired token")
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        // compare provided plain token with hashed token in DB
        const isMatch = await bcrypt.compare(token, user.verifyToken || "");
        if (!isMatch) {
            console.log("token mismatch")
            return NextResponse.json({ error: "Invalid token" }, { status: 400 });
        }

        // set verified flag (note: model field is `isVerified`)
        user.isVerified = true;
        user.verifyToken = undefined;
        user.verifyTokenExpiry = undefined;
        await user.save();

        return NextResponse.json({ message: "Email verified successfully", success: true });

    } catch (error:any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}