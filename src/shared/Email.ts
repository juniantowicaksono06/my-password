import nodemailer from 'nodemailer';

class Email {
    private transporter: nodemailer.Transporter | null = null;
    private mailOptions: {
        from: string;
        to?: string;
        subject?: string;
        text?: string;
        html?: string;
    } | null = null;
    init() {
        this.transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER_MAIL,
                pass: process.env.GMAIL_APP_KEY
            }
        });
        this.mailOptions = {
            from: process.env.GMAIL_USER_MAIL as string,
        }
        return this;
    }
    sendEmail(to: string, subject: string, text: string = "", html = "") {
        if(this.mailOptions !== null) {
            this.mailOptions['to'] = to;
            this.mailOptions['subject'] = subject;
            if(html !== "") {
                this.mailOptions['html'] = html;
            }
            else {
                this.mailOptions['text'] = text;
            }
        }
        else {
            if(html !== "") {
                this.mailOptions = {
                    from: process.env.GMAIL_USER_MAIL as string,
                    to: to,
                    subject: subject,
                    html: html
                }
            }
            else{
                this.mailOptions = {
                    from: process.env.GMAIL_USER_MAIL as string,
                    to: to,
                    subject: subject,
                    text: text
                }
            }
        }
        return this.transporter?.sendMail(this.mailOptions);
    }
}

export default Email;