import crypto from 'node:crypto';

import jsonwebtoken from 'jsonwebtoken';

import * as resetPasswordService from '../../../../../src/identity-access-management/domain/services/reset-password.service.js';
import { config as settings } from '../../../../../src/shared/config.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Identity Access Management | Domain | Service | reset-password', function () {
  describe('#generateTemporaryKey', function () {
    let randomGeneratedString;

    beforeEach(function () {
      sinon.stub(jsonwebtoken, 'sign');
      randomGeneratedString = 'aaaaaa';
      sinon.stub(crypto, 'randomBytes').resolves(randomGeneratedString);
    });

    it('calls sign function from jwt', async function () {
      // given
      const signParams = {
        payload: { data: randomGeneratedString },
        secret: settings.temporaryKey.secret,
        expiration: { expiresIn: settings.temporaryKey.tokenLifespan },
      };

      // when
      await resetPasswordService.generateTemporaryKey();

      // then
      sinon.assert.calledOnce(jsonwebtoken.sign);
      sinon.assert.calledWith(jsonwebtoken.sign, signParams.payload, signParams.secret, signParams.expiration);
    });
  });

  describe('#invalidateOldResetPasswordDemand', function () {
    let resetPasswordDemandRepository;

    beforeEach(function () {
      resetPasswordDemandRepository = {
        markAsBeingUsed: sinon.stub(),
      };
    });

    it('calls reset password repository', function () {
      // given
      const userEmail = 'shi@fu.me';
      resetPasswordDemandRepository.markAsBeingUsed.resolves();

      // when
      const promise = resetPasswordService.invalidateOldResetPasswordDemand(userEmail, resetPasswordDemandRepository);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(resetPasswordDemandRepository.markAsBeingUsed);
        sinon.assert.calledWith(resetPasswordDemandRepository.markAsBeingUsed, userEmail);
      });
    });
  });

  describe('#hasUserAPasswordResetDemandInProgress', function () {
    const userEmail = 'shi@fu.me';
    let resetPasswordDemandRepository;

    beforeEach(function () {
      resetPasswordDemandRepository = {
        findByUserEmail: sinon.stub(),
      };
      resetPasswordDemandRepository.findByUserEmail.throws();
      resetPasswordDemandRepository.findByUserEmail.withArgs(userEmail, 'good-temporary-key').resolves();
      resetPasswordDemandRepository.findByUserEmail.withArgs(userEmail, 'bad-temporary-key').rejects();
    });

    context('when there is a matching password reset demand', function () {
      it('resolves', async function () {
        await resetPasswordService.hasUserAPasswordResetDemandInProgress(
          userEmail,
          'good-temporary-key',
          resetPasswordDemandRepository,
        );
      });
    });

    context('when there is no matching password reset demand', function () {
      it('resolves', function () {
        const promise = resetPasswordService.hasUserAPasswordResetDemandInProgress(
          userEmail,
          'bad-temporary-key',
          resetPasswordDemandRepository,
        );
        return expect(promise).to.be.rejected;
      });
    });
  });
});
