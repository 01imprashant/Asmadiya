import nodemailer from "nodemailer";
// Create a test account or replace with real credentials.
const sendMail = async (email:any, subject:string, Message:string) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASS,
    },
  })
  await transporter.sendMail({
    from: process.env.MY_EMAIL, // sender address
    to: email, // list of receivers
    text: Message, // plain‑text body
  })
};

export default sendMail;