import { Injectable, Logger } from '@nestjs/common';
import * as SgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  logger = new Logger(EmailService.name);

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
      from: process.env.SENDGRID_EMAIL_FROM_ADDRESS, // Now using environment variable
      subject: subject,
      html: htmlContent,
    };
    try {
      const res = await SgMail.send(msg);
      this.logger.log('Email sent:', res);
    } catch (error) {
      this.logger.error('Error sending email:', error);
    }
  }
}
