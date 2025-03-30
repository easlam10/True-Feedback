import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/Users";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json();
    
    // Check for existing verified user with same username
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json({
        success: false,
        message: "Username already exists",
      }, { status: 400 });
    }

    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json({
          success: false,
          message: "User already exists with this email",
        }, { status: 400 });
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour
        await existingUserByEmail.save();
        
        // Send verification email
        const emailResponse = await sendVerificationEmail(
          email, 
          username, 
          verifyCode
        );
        
        if (!emailResponse.success) {
          return Response.json({
            success: false,
            message: emailResponse.message,
          }, { status: 500 });
        }
        
        return Response.json({
          success: true,
          message: "User updated. Please check your email to verify your account",
        }, { status: 200 });
      }
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: new Date(Date.now() + 3600000), // 1 hour
        isVerified: false,
        isAcceptingMessages: true,
        messages: []
      });
      
      await newUser.save();
      
      // Send verification email
      const emailResponse = await sendVerificationEmail(
        email, 
        username, 
        verifyCode
      );
      
      if (!emailResponse.success) {
        return Response.json({
          success: false,
          message: emailResponse.message,
        }, { status: 500 });
      }
      
      return Response.json({
        success: true,
        message: "User registered successfully. Please check your email to verify your account",
      }, { status: 201 });
    }
  } catch (error) {
    console.error("Error registering user", error);
    return Response.json(
      {
        success: false,
        message: "Error registering user. Please try again.",
      },
      { status: 500 }
    );
  }
}