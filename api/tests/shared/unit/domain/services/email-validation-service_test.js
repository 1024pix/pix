import { validateEmailSyntax } from '../../../../../src/shared/domain/services/email-validation-service.js';

describe('Unit | Shared | Domain | Services | EmailValidationService', function () {
  describe('#validateEmailSyntax', function () {
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
