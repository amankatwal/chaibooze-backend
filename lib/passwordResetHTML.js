export const passwordResetHTML = (user, passwordResetURL) =>{
    return`
    <!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password | Chaibooze</title>
    <style>
      body {
        margin: 0;
        font-family: "Poppins", Arial, sans-serif;
        background-color: #0f1724;
        color: #ffffff;
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
      }

      .email-container {
        background: linear-gradient(145deg, #111c2e, #0b1220);
        border: 1px solid rgba(255, 255, 255, 0.05);
        border-radius: 14px;
        padding: 40px 30px;
        width: 100%;
        max-width: 480px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
        text-align: center;
      }

      .logo {
        font-size: 28px;
        font-weight: 700;
        color: #9be7d4;
        margin-bottom: 16px;
        letter-spacing: 1px;
      }

      h2 {
        font-size: 22px;
        font-weight: 600;
        margin-bottom: 12px;
        color: #e6eef6;
      }

      p {
        color: #9aa4b2;
        font-size: 15px;
        line-height: 1.6;
        margin-bottom: 30px;
      }

      .btn {
        background: linear-gradient(90deg, #9be7d4, #7ad0b7);
        color: #062026;
        padding: 14px 30px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        display: inline-block;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(155, 231, 212, 0.25);
      }

      .footer {
        margin-top: 40px;
        font-size: 13px;
        color: #9aa4b2;
      }

      .footer a {
        color: #9be7d4;
        text-decoration: none;
      }

      @media (max-width: 500px) {
        .email-container {
          padding: 30px 20px;
        }
        h2 {
          font-size: 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="logo">Chaibooze</div>
      <h2>Password Reset Request</h2>
      <p>
       <b>Hi ${user.name}</ b>, We received a request to reset your password for your
        Chaibooze account. Click the button below to securely reset your
        password.
      </p>

      <a href="${passwordResetURL}" class="btn">Reset Password</a>
      <p style="margin-top: 24px; font-size: 14px">
        This link will expire in <strong>1 hour</strong>. If you didn’t request
        this, please ignore this email — your account will remain secure.
      </p>

      <div class="footer">
        © 2025 <a href="https://chaibooze.com">Chaibooze</a>. All rights
        reserved.
      </div>
    </div>
  </body>
</html>`
}