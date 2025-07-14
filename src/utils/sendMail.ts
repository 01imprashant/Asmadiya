// export async function sendMail(
//   to: string,
//   subject: string,
//   body: string
// ): Promise<boolean> {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.gmail.com",
//     port: 587,
//     secure: false, // use TLS
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
 
//   const info = await transporter.sendMail({
//     from: `"GTMxASMT - " <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html: body,
//   });
//   if (info.messageId) {
//     console.log(
//       "Mail sent: %s",
//       info.messageId,
//       "\nfrom :\t",
//       process.env.EMAIL_USER,
//       "\nto\t: ",
//       to
//     );
//     return true;
//   } 
//   else {
//     return false;
//   }
// }



import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.MY_EMAIL,,
    pass: "jn7jnAPss4f63QBp6D",
  },
});

// Wrap in an async IIFE so we can use await.
(async () => {
  const info = await transporter.sendMail({
    from: '"Maddison Foo Koch" <maddison53@ethereal.email>',
    to: "bar@example.com, baz@example.com",
    subject: "Hello ✔",
    text: "Hello world?", // plain‑text body
    html: "<b>Hello world?</b>", // HTML body
  });

  console.log("Message sent:", info.messageId);
})();