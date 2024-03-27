import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import ejs from 'ejs';
import dotenv from 'dotenv';
import format from 'string-format';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const user = process.env.EMAIL_HOST_USER;
const pass = process.env.EMAIL_HOST_PASSWORD;
format.extend(String.prototype, {});
const transport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass
  }
});

const mailer = async (
  receiver,
  subject,
  context,
  template,
  use_file_template = true
) => {
  try {
    const template_path = path.join(
      __dirname,
      '..',
      'templates',
      'emails',
      `${template}.ejs`
    );
    const html = use_file_template
      ? await ejs.renderFile(template_path, context)
      : template; //.format(context);
    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: receiver,
      subject,
      html
    };

    const info = await transport.sendMail(mailOptions);
    console.log(`Message sent to ${receiver}: ${info.messageId}`);
  } catch (e) {
    console.error('Error sending Email: %s', e.message);
    throw e;
  }
};

export { mailer };
