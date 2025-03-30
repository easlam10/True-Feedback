import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import UserModel from "@/models/Users";
import dbConnect from "@/lib/dbConnect";

export const authOptions: NextAuthOptions = {
  providers: [

    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "email@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any): Promise<any> {
        await dbConnect();

        try {
          // Find user by email
          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });

          if (!user) {
            throw new Error("No user found with this email");
          }

          if (!user.isVerified) {
            throw new Error("Please verify your email first");
          }

          // Compare passwords
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isValid) {
            throw new Error("Incorrect password");
          }

          return user;
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
 pages: {
    signIn : '/signIn'
 },
 callbacks: {
  async jwt({ token, user }) {
    if (user) {
      token._id = user._id?.toString(); // Convert ObjectId to string
      token.isVerified = user.isVerified;
      token.isAcceptingMessages = user.isAcceptingMessages;
      token.username = user.username;
    }
    return token;
  },
  async session({ session, token }) {
    if (token) {
      session.user._id = token._id;
      session.user.isVerified = token.isVerified;
      session.user.isAcceptingMessages = token.isAcceptingMessages;
      session.user.username = token.username;
    }
    return session;
  },
},
session: {
  strategy: 'jwt',
},
 secret: process.env.NEXTAUTH_SECRET
}
