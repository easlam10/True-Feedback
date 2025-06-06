import {z} from "zod"

export const signInSchema = z.object({
    email: z.string().email({message: "invalid email address"}),
    password: z.string().min(8, "Password must be at least 8 characters long"),
})