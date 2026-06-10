export const signUpMail = (username) =>{
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to Chaibooze!</title>
  <style>
    body {
      font-family: 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f7f3ef;
      margin: 0;
      padding: 0;
    }

    .container {
      max-width: 600px;
      background-color: #fffaf5;
      margin: 40px auto;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(139, 69, 19, 0.15);
      overflow: hidden;
    }

    .header {
      background-color: #5c3a21;
      text-align: center;
      padding: 30px 20px;
    }

    .header h1 {
      color: #f9e4cc;
      font-size: 28px;
      margin: 0;
    }

    .header p {
      color: #d7bfa5;
      margin-top: 5px;
      font-size: 14px;
    }

    .content {
      padding: 30px 25px;
      text-align: center;
      color: #4b2e16;
    }

    .content h2 {
      color: #4b2e16;
      font-size: 22px;
      margin-bottom: 10px;
    }

    .content p {
      font-size: 15px;
      line-height: 1.6;
      margin: 10px 0 25px;
    }

    .button {
      display: inline-block;
      padding: 12px 28px;
      background-color: #8b4513;
      color: #fffaf5;
      border-radius: 6px;
      text-decoration: none;
      font-weight: bold;
      transition: background 0.3s ease;
    }

    .button:hover {
      background-color: #6b3410;
    }

    .footer {
      background-color: #f3e7dc;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6a4e39;
    }

    .footer a {
      color: #8b4513;
      text-decoration: none;
      font-weight: bold;
    }

    .coffee-cup {
      font-size: 38px;
      margin-bottom: 15px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="coffee-cup">☕</div>
      <h1>Welcome to Chaibooze!</h1>
      <p>Your daily sip of chai & caffeine</p>
    </div>

    <div class="content">
      <h2>Hey ${username},</h2>
      <p>
        Thanks for signing up with <strong>Chaibooze</strong>!  
        You’re officially part of our caffeinated coding community.  
        Please verify your email to complete your registration.
      </p>
    </div>

    <div class="footer">
      <p>
        Made with ❤️ and ☕ by the <strong>Chaibooze</strong> Team<br>
        <a href="https://chaibooze.com">chaibooze.com</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}