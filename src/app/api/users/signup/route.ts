import { connect } from "@/configdb/dbConfig";
import User from "@/models/userModel";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/helpers/mailer";

connect();

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { username, email, password } = await reqBody;
        console.log(reqBody);
        const user = await User.findOne({ email });
        if (user) {
            return NextResponse.json(
                { message: "User already exists" },
                { status: 400 }
            );
        }
        const salt = await bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        })
        const saveUser = await newUser.save();
        console.log(saveUser);

        // send Email 
        await sendEmail({email, emailType: "VERIFY", userId: saveUser._id});
        return NextResponse.json({
            message: "User registered successfully. Please check your email to verify your account.",
            success: true,
            saveUser
        })


    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
