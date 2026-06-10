import crypto from "crypto";

export const passwordResetToken = ()=>{
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    const expiryTimeToken = Date.now() + 1000*60*10;
    return {resetToken, hashedToken, expiryTimeToken};
}