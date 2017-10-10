const jsonwebtoken = require('jsonwebtoken');
const { describe, it, sinon, beforeEach, afterEach } = require('../../../test-helper');
const settings = require('../../../../lib/settings');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');
const resetPasswordRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');

describe('Unit | Service | Password Service', function() {

  describe('#generateTemporaryKey', function() {

    beforeEach(() => {
      sinon.stub(jsonwebtoken, 'sign');
    });

    afterEach(() => {
      jsonwebtoken.sign.restore();
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

    afterEach(() => {
      resetPasswordRepository.markAsBeingUsed.restore();
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
});
