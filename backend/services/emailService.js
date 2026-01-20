const transporter = require("../config/mail");

exports.sendOTP = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP for Registration",
    text: `Your OTP is: ${otp}`,
  };

  await transporter.sendMail(mailOptions);
};
