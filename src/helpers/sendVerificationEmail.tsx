import VerificationEmail from "../../emails/verification-email-template";
import { resend } from "@/lib/resend";
import { ApiResponse } from "@/types/apiResponse";

export async function sendVerificationEmail(
    email: string,
    username: string,
    verifyCode: string
) : Promise<ApiResponse> {
    try {
        await resend.emails.send({
            from: 'Acme <onboarding@resend.dev>',
            to: email,
            subject: 'Mystry Message Verification Code',
            react: VerificationEmail({username, otp: verifyCode})
          });

        return {
            success: true,
            message: "verification email successfully sent"
        }

    }

    catch (error) {
        console.error("Error sending email:", error);
        return {
            success: false,
            message: "failed to send verification email"
        }
    }
}
