import { z } from "zod";

export const usernameValidation = z.
string().
min(3, "Username must be at least 3 characters long").
max(20, "Username must be at most 20 characters long").
regex(/^[a-zA-Z0-9]+$/, "Username can only contain letters and numbers").
trim()

export const signUpSchema = z.object({
    username: usernameValidation,
    email: z.string().email({message: "invalid email address"}),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})