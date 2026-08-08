const assert = require('assert');
const {
  normalizeAccountStatus,
  isAccountStatusAllowedForLogin,
} = require('../controllers/UserRegistrationAndValidationController');

assert.strictEqual(normalizeAccountStatus('Approved'), 'Active');
assert.strictEqual(normalizeAccountStatus('approved'), 'Active');
assert.strictEqual(normalizeAccountStatus('Active'), 'Active');
assert.strictEqual(normalizeAccountStatus('Pending'), 'Pending');
assert.strictEqual(normalizeAccountStatus('Deactivated'), 'Deactivated');
assert.strictEqual(isAccountStatusAllowedForLogin('Approved'), true);
assert.strictEqual(isAccountStatusAllowedForLogin('Pending'), false);
assert.strictEqual(isAccountStatusAllowedForLogin('Deactivated'), false);

console.log('login auth status normalization tests passed');
