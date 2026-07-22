import sinon from 'sinon';

import { resetPasswordService } from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { config } from '../../../../../src/shared/config.js';
import { InvalidTemporaryKeyError } from '../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../src/shared/domain/services/token-service.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Service | reset-password', function () {
  describe('#generateTemporaryKey', function () {
    it('creates a token that can be decoded and contains a base64 data property', async function () {
      // when
      const temporaryKey = await resetPasswordService.generateTemporaryKey();

      // then
      expect(temporaryKey).to.be.a('string');

      const decoded = tokenService.getDecodedToken(temporaryKey, config.passwordResetDemand.secret);
      expect(decoded).to.have.property('data');
      expect(decoded.data).to.be.a('string');
      expect(decoded.data.length).to.equal(24);
    });

    it('generates different temporaryKeys', async function () {
      // when
      const temporaryKeyUser1 = await resetPasswordService.generateTemporaryKey();
      const temporaryKeyUser2 = await resetPasswordService.generateTemporaryKey();

      // then
      expect(temporaryKeyUser1).to.not.equal(temporaryKeyUser2);
    });
  });

  describe('#assertTemporaryKey', function () {
    it('does not throw for a valid temporary key', async function () {
      // given
      const temporaryKey = await resetPasswordService.generateTemporaryKey();

      // when / then
      expect(() => resetPasswordService.assertTemporaryKey(temporaryKey)).to.not.throw();
    });

    it('throws InvalidTemporaryKeyError for an invalid token', function () {
      // given
      const invalidToken = 'not.a.valid.token';

      // when / then
      expect(() => resetPasswordService.assertTemporaryKey(invalidToken)).to.throw(InvalidTemporaryKeyError);
    });
  });

  describe('#invalidateOldResetPasswordDemandsByEmail', function () {
    let resetPasswordDemandRepository;

    beforeEach(function () {
      resetPasswordDemandRepository = {
        markAllAsUsedByEmail: sinon.stub(),
      };
    });

    it('calls reset password repository', function () {
      // given
      const userEmail = 'shi@fu.me';
      resetPasswordDemandRepository.markAllAsUsedByEmail.resolves();

      // when
      const promise = resetPasswordService.invalidateOldResetPasswordDemandsByEmail(
        userEmail,
        resetPasswordDemandRepository,
      );

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(resetPasswordDemandRepository.markAllAsUsedByEmail);
        sinon.assert.calledWith(resetPasswordDemandRepository.markAllAsUsedByEmail, userEmail);
      });
    });
  });

  describe('#invalidateResetPasswordDemand', function () {
    const userEmail = 'shi@fu.me';
    let resetPasswordDemandRepository;

    beforeEach(function () {
      resetPasswordDemandRepository = {
        markAsUsed: sinon.stub(),
      };
      resetPasswordDemandRepository.markAsUsed.throws();
      resetPasswordDemandRepository.markAsUsed.withArgs(userEmail, 'good-temporary-key').resolves();
      resetPasswordDemandRepository.markAsUsed.withArgs(userEmail, 'bad-temporary-key').rejects();
    });

    context('when there is a matching password reset demand', function () {
      it('resolves', async function () {
        await resetPasswordService.invalidateResetPasswordDemand(
          userEmail,
          'good-temporary-key',
          resetPasswordDemandRepository,
        );
      });
    });

    context('when there is no matching password reset demand', function () {
      it('resolves', function () {
        const promise = resetPasswordService.invalidateResetPasswordDemand(
          userEmail,
          'bad-temporary-key',
          resetPasswordDemandRepository,
        );
        return expect(promise).to.be.rejected;
      });
    });
  });
});
