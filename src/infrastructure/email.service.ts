import { Injectable } from '@nestjs/common';
import * as SgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  constructor() {
    SgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
  ): Promise<void> {
    const msg = {
      to: to,
      from: process.env.EMAIL_FROM_ADDRESS, // Now using environment variable
      subject: subject,
      html: htmlContent,
    };
    await SgMail.send(msg);
  }
}
