const jsonwebtoken = require('jsonwebtoken');
const { sinon, expect } = require('../../../test-helper');
const settings = require('../../../../lib/config');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');
const resetPasswordRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');

describe('Unit | Service | Password Service', function() {

  describe('#generateTemporaryKey', function() {

    beforeEach(() => {
      sinon.stub(jsonwebtoken, 'sign');
    });

    it('should call sign function from jwt', () => {
      // given
      const signParams = {
        payload: { data: settings.temporaryKey.payload },
        secret: settings.temporaryKey.secret,
        expiration: { expiresIn: settings.temporaryKey.tokenLifespan }
      };

      // when
      resetPasswordService.generateTemporaryKey();

      // then
      sinon.assert.calledOnce(jsonwebtoken.sign);
      sinon.assert.calledWith(jsonwebtoken.sign, signParams.payload, signParams.secret, signParams.expiration);
    });
  });

  describe('#invalidOldResetPasswordDemand', function() {

    beforeEach(() => {
      sinon.stub(resetPasswordRepository, 'markAsBeingUsed');
    });

    it('should call reset password repository', () => {
      // given
      const userEmail = 'shi@fu.me';
      resetPasswordRepository.markAsBeingUsed.resolves();

      // when
      const promise = resetPasswordService.invalidOldResetPasswordDemand(userEmail);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(resetPasswordRepository.markAsBeingUsed);
        sinon.assert.calledWith(resetPasswordRepository.markAsBeingUsed, userEmail);
      });
    });
  });

  describe('#hasUserAPasswordResetDemandInProgress', function() {
    const userEmail = 'shi@fu.me';

    beforeEach(function() {
      sinon.stub(resetPasswordRepository, 'findByUserEmail').throws();

      resetPasswordRepository.findByUserEmail
        .withArgs(userEmail, 'good-temporary-key')
        .resolves();

      resetPasswordRepository.findByUserEmail
        .withArgs(userEmail, 'bad-temporary-key')
        .rejects();
    });

    context('when there is a matching password reset demand', function() {
      it('resolves', async function() {
        await resetPasswordService.hasUserAPasswordResetDemandInProgress(userEmail, 'good-temporary-key');
      });
    });

    context('when there is no matching password reset demand', function() {
      it('resolves', function() {
        const promise = resetPasswordService.hasUserAPasswordResetDemandInProgress(userEmail, 'bad-temporary-key');
        return expect(promise).to.be.rejected;
      });
    });

  });
});
