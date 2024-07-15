import { PasswordResetDemandNotFoundError } from '../../../../src/identity-access-management/domain/errors.js';
import { expect } from '../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Errors', function () {
  describe('#PasswordResetDemandNotFoundError', function () {
    it('has a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          temporaryKey: ['Cette demande de réinitialisation n’existe pas.'],
        },
      };

      // then
      const error = new PasswordResetDemandNotFoundError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });
});
