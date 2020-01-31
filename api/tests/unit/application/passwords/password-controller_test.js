const { sinon, expect, hFake } = require('../../../test-helper');

const passwordController = require('../../../../lib/application/passwords/password-controller');

const tokenService = require('../../../../lib/domain/services/token-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');

const resetPasswordRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const passwordResetSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const errorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const User = require('../../../../lib/domain/models/User');

describe('Unit | Controller | PasswordController', () => {

  describe('#createResetDemand', () => {
    const userEmail = 'shi@fu.me';

    const request = {
      payload: {
        data: {
          attributes: {
            email: userEmail
          }
        }
      }
    };

    beforeEach(() => {
      sinon.stub(userRepository, 'isUserExistingByEmail');
      sinon.stub(mailService, 'sendResetPasswordDemandEmail');
      sinon.stub(resetPasswordService, 'generateTemporaryKey');
      sinon.stub(resetPasswordService, 'invalidateOldResetPasswordDemand');
      sinon.stub(resetPasswordRepository, 'create');
      sinon.stub(errorSerializer, 'serialize');
      sinon.stub(passwordResetSerializer, 'serialize');
    });

    it('should reply with serialized password reset demand when all went well', async () => {
      // given
      const generatedToken = 'token';
      const demand = { email: 'shi@fu.me', temporaryKey: generatedToken };
      const hostBaseUrl = 'https://localhost';
      const resolvedPasswordReset = {
        attributes: {
          email: 'Giles75@hotmail.com',
          temporaryKey: 'one token',
          id: 15
        }
      };

      userRepository.isUserExistingByEmail.resolves();
      resetPasswordService.generateTemporaryKey.returns(generatedToken);
      mailService.sendResetPasswordDemandEmail.resolves(resolvedPasswordReset);
      resetPasswordRepository.create.resolves(resolvedPasswordReset);
      passwordResetSerializer.serialize.returns();

      // when
      await passwordController.createResetDemand(request, hFake);

      // then
      sinon.assert.calledWith(userRepository.isUserExistingByEmail, userEmail);
      sinon.assert.calledOnce(resetPasswordService.generateTemporaryKey);
      sinon.assert.calledWith(resetPasswordRepository.create, demand);
      sinon.assert.calledWith(mailService.sendResetPasswordDemandEmail, request.payload.data.attributes.email, hostBaseUrl, generatedToken);
      sinon.assert.calledWith(passwordResetSerializer.serialize, resolvedPasswordReset.attributes);
    });
  });

  describe('#checkResetDemand', () => {
    const request = {
      params: {
        temporaryKey: 'token'
      }
    };
    const fetchedUser = new User({
      id: 'user_id',
      email: 'email@lost-password.fr'
    });

    const fetchedPasswordResetDemand = {
      email: 'lost_pwd@email.fr'
    };

    beforeEach(() => {
      sinon.stub(resetPasswordService, 'verifyDemand');
      sinon.stub(tokenService, 'verifyValidity').resolves({});
      sinon.stub(errorSerializer, 'serialize');
      sinon.stub(userRepository, 'findByEmail').resolves(fetchedUser);
      sinon.stub(userSerializer, 'serialize');
    });

    it('should verify temporary key validity (format, signature, expiration)', () => {
      // when
      const promise = passwordController.checkResetDemand(request, hFake);

      // then
      return promise.catch(() => {
        sinon.assert.calledOnce(tokenService.verifyValidity);
        sinon.assert.calledWith(tokenService.verifyValidity, request.params.temporaryKey);
      });

    });

    it('should verify password reset demand  from provided temporary key', () => {
      // when
      resetPasswordService.verifyDemand.resolves(fetchedPasswordResetDemand);
      const promise = passwordController.checkResetDemand(request, hFake);

      // then
      return promise.catch(() => {
        sinon.assert.calledOnce(resetPasswordService.verifyDemand);
        sinon.assert.calledWith(resetPasswordService.verifyDemand, request.params.temporaryKey);
      });

    });

    describe('When temporaryKey is valid and related to a password reset demand', () => {

      it('should get user details from email', async () => {
        // given
        resetPasswordService.verifyDemand.resolves(fetchedPasswordResetDemand);

        // when
        await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(userRepository.findByEmail);
        sinon.assert.calledWith(userRepository.findByEmail, fetchedPasswordResetDemand.email);
      });

      it('should reply with a serialized user with some fields', async () => {
        // given
        const serializedUser = {};
        resetPasswordService.verifyDemand.resolves(fetchedPasswordResetDemand);
        userRepository.findByEmail.resolves(fetchedUser);
        userSerializer.serialize.returns(serializedUser);

        // when
        const response = await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(userSerializer.serialize);
        sinon.assert.calledWith(userSerializer.serialize, fetchedUser);
        expect(response).to.deep.equal(serializedUser);
      });

    });
  });
});
