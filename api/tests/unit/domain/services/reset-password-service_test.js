import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import { sinon, expect } from '../../../test-helper';
import settings from '../../../../lib/config';
import resetPasswordService from '../../../../lib/domain/services/reset-password-service';
import resetPasswordRepository from '../../../../lib/infrastructure/repositories/reset-password-demands-repository';

describe('Unit | Service | Password Service', function () {
  describe('#generateTemporaryKey', function () {
    let randomGeneratedString;

    beforeEach(function () {
      sinon.stub(jsonwebtoken, 'sign');
      randomGeneratedString = 'aaaaaa';
      sinon.stub(crypto, 'randomBytes').returns(randomGeneratedString);
    });

    it('should call sign function from jwt', function () {
      // given
      const signParams = {
        payload: { data: randomGeneratedString },
        secret: settings.temporaryKey.secret,
        expiration: { expiresIn: settings.temporaryKey.tokenLifespan },
      };

      // when
      resetPasswordService.generateTemporaryKey();

      // then
      sinon.assert.calledOnce(jsonwebtoken.sign);
      sinon.assert.calledWith(jsonwebtoken.sign, signParams.payload, signParams.secret, signParams.expiration);
    });
  });

  describe('#invalidateOldResetPasswordDemand', function () {
    beforeEach(function () {
      sinon.stub(resetPasswordRepository, 'markAsBeingUsed');
    });

    it('should call reset password repository', function () {
      // given
      const userEmail = 'shi@fu.me';
      resetPasswordRepository.markAsBeingUsed.resolves();

      // when
      const promise = resetPasswordService.invalidateOldResetPasswordDemand(userEmail);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(resetPasswordRepository.markAsBeingUsed);
        sinon.assert.calledWith(resetPasswordRepository.markAsBeingUsed, userEmail);
      });
    });
  });

  describe('#hasUserAPasswordResetDemandInProgress', function () {
    const userEmail = 'shi@fu.me';

    beforeEach(function () {
      sinon.stub(resetPasswordRepository, 'findByUserEmail').throws();

      resetPasswordRepository.findByUserEmail.withArgs(userEmail, 'good-temporary-key').resolves();

      resetPasswordRepository.findByUserEmail.withArgs(userEmail, 'bad-temporary-key').rejects();
    });

    context('when there is a matching password reset demand', function () {
      it('resolves', async function () {
        await resetPasswordService.hasUserAPasswordResetDemandInProgress(userEmail, 'good-temporary-key');
      });
    });

    context('when there is no matching password reset demand', function () {
      it('resolves', function () {
        const promise = resetPasswordService.hasUserAPasswordResetDemandInProgress(userEmail, 'bad-temporary-key');
        return expect(promise).to.be.rejected;
      });
    });
  });
});
