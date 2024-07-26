const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendConfirmationEmail = (email, token) => {
  const url = process.env.ROOT_URL +`/auth/confirm/${token}`;
  transporter.sendMail({
    to: email,
    subject: 'Confirm Email',
    html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
  });
};

const sendResetPasswordEmail = (email, password) => {
  transporter.sendMail({
    to: email,
    subject: 'Reset Password',
    html: `Your new password is: ${password}\nPlease change it after login`,
  });
};

module.exports = { sendConfirmationEmail, sendResetPasswordEmail };
