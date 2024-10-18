import { validateEmailSyntax } from '../../../../../src/shared/domain/services/email-validation-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Shared | Domain | Services | EmailValidationService', function () {
  describe('#validateEmailSyntax', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      ['test', false],
      ['test@toto', false],
      ['@toto', false],
      ['?lionel@toto?ru', false],
      ['valid@example.net', true],
    ].forEach(([email, valid]) => {
      it(`should ${valid ? 'validate' : 'not validate'} email ${email}`, function () {
        expect(validateEmailSyntax(email)).to.equal(valid);
      });
    });
  });
});
