const assert = require('assert');

process.env.SMTP_HOST = 'smtp.example.com';
process.env.SMTP_PORT = '587';
process.env.SMTP_SECURE = 'false';
process.env.SMTP_USER = 'mailer@example.com';
process.env.SMTP_PASS = 'secret';
process.env.SMTP_FROM = 'Clinic <clinic@example.com>';

const otpController = require('../controllers/otpController');
const transporter = otpController.createOtpMailerTransport();

assert.strictEqual(transporter.options.host, 'smtp.example.com');
assert.strictEqual(transporter.options.port, 587);
assert.strictEqual(transporter.options.secure, false);
assert.strictEqual(transporter.options.auth.user, 'mailer@example.com');
assert.strictEqual(transporter.options.auth.pass, 'secret');
assert.strictEqual(transporter.options.from, 'Clinic <clinic@example.com>');

console.log('otp email config tests passed');
