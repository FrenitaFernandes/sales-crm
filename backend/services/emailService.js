const transporter = require("../config/mail");

// Send Welcome Email (No OTP)
exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Sales CRM!",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering with our System.</p>
      <p>Your account has been created successfully.</p>
      <br/>
      <p>Regards,<br/>Sales CRM Team</p>
    `,
  };
  
  await transporter.sendMail(mailOptions);
};

// ===============================
// PASSWORD CHANGED EMAIL
// ===============================
exports.sendPasswordChangedEmail = async (email) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Changed Successfully",
    html: `
      <h2>Password Updated</h2>
      <p>Your password has been changed successfully.</p>
      <p>If you did not perform this action, please reset your password immediately.</p>
      <br/>
      <p>Regards,<br/>Sales CRM Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};