const { sinon, expect, hFake } = require('../../../test-helper');
const { UserNotFoundError, InternalError, InvalidTemporaryKeyError, PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

const passwordController = require('../../../../lib/application/passwords/password-controller');

const userService = require('../../../../lib/domain/services/user-service');
const tokenService = require('../../../../lib/domain/services/token-service');
const mailService = require('../../../../lib/domain/services/mail-service');
const resetPasswordService = require('../../../../lib/domain/services/reset-password-service');

const resetPasswordRepository = require('../../../../lib/infrastructure/repositories/reset-password-demands-repository');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');

const passwordResetSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');
const errorSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/validation-error-serializer');

const User = require('../../../../lib/domain/models/User');

const logger = require('../../../../lib/infrastructure/logger');

describe('Unit | Controller | PasswordController', () => {

  describe('#createResetDemand', () => {

    describe('When payload has a good format: ', () => {

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

        sinon.stub(userService, 'isUserExistingByEmail');
        sinon.stub(mailService, 'sendResetPasswordDemandEmail');
        sinon.stub(resetPasswordService, 'generateTemporaryKey');
        sinon.stub(resetPasswordService, 'invalidOldResetPasswordDemand');
        sinon.stub(resetPasswordRepository, 'create');
        sinon.stub(errorSerializer, 'serialize');
        sinon.stub(passwordResetSerializer, 'serialize');
        sinon.stub(logger, 'error');
      });

      describe('User existence test cases', () => {

        it('should verify user existence (by email)', async () => {
          // given
          userService.isUserExistingByEmail.resolves();

          //when
          await passwordController.createResetDemand(request, hFake);

          // then
          sinon.assert.calledOnce(userService.isUserExistingByEmail);
          sinon.assert.calledWith(userService.isUserExistingByEmail, userEmail);
        });

        it('should verify user existence without being case sensitive', async () => {
          // given
          userService.isUserExistingByEmail.resolves();

          const userEmailWithCamelCase = 'my_VERY_email@example.net';
          const normalizedUserEmail = 'my_very_email@example.net';

          const request = {
            payload: {
              data: {
                attributes: {
                  email: userEmailWithCamelCase
                }
              }
            }
          };

          //when
          await passwordController.createResetDemand(request, hFake);

          // then
          sinon.assert.calledOnce(userService.isUserExistingByEmail);
          sinon.assert.calledWith(userService.isUserExistingByEmail, normalizedUserEmail);
        });

        it('should rejects an error, when user is not found', async () => {
          // given
          const error = new UserNotFoundError();
          const expectedErrorMessage = error.getErrorMessage();
          const serializedError = {};
          errorSerializer.serialize.returns(serializedError);
          userService.isUserExistingByEmail.rejects(error);

          //when
          const response = await passwordController.createResetDemand(request, hFake);

          // then
          sinon.assert.calledOnce(errorSerializer.serialize);
          sinon.assert.calledWith(errorSerializer.serialize, expectedErrorMessage);
          expect(response.source).to.deep.equal(serializedError);
        });

        it('should log the error when something turns wrong', async () => {
          // given
          const error = new Error();
          userService.isUserExistingByEmail.rejects(error);

          //when
          await passwordController.createResetDemand(request, hFake);

          // then
          expect(logger.error).to.have.been.calledWith(error);
        });
      });

      it('should invalid old reset password demand', async () => {
        // given
        userService.isUserExistingByEmail.resolves();
        resetPasswordService.invalidOldResetPasswordDemand.resolves();

        //when
        await passwordController.createResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(resetPasswordService.invalidOldResetPasswordDemand);
        sinon.assert.calledWith(resetPasswordService.invalidOldResetPasswordDemand, request.payload.data.attributes.email);
      });

      it('should ask for a temporary token generation', async () => {
        // given
        const generatedToken = 'token';
        userService.isUserExistingByEmail.resolves();
        resetPasswordService.generateTemporaryKey.returns(generatedToken);

        //when
        await passwordController.createResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(resetPasswordService.generateTemporaryKey);
      });

      it('should save a new reset password demand', async () => {
        // given
        const generatedToken = 'token';
        const demand = { email: 'shi@fu.me', temporaryKey: generatedToken };
        userService.isUserExistingByEmail.resolves();
        resetPasswordService.generateTemporaryKey.returns(generatedToken);
        resetPasswordRepository.create.resolves();

        //when
        await passwordController.createResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(resetPasswordRepository.create);
        sinon.assert.calledWith(resetPasswordRepository.create, demand);
      });

      it('should send an email with a reset password link', async () => {
        // given
        const generatedToken = 'token';
        const hostBaseUrl = 'http://localhost';
        userService.isUserExistingByEmail.resolves();
        resetPasswordService.generateTemporaryKey.returns(generatedToken);
        const resolvedPasswordReset = {
          attributes: {
            email: 'Giles75@hotmail.com',
            temporaryKey: 'one token',
            id: 15
          }
        };
        resetPasswordRepository.create.resolves(resolvedPasswordReset);

        //when
        await passwordController.createResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(mailService.sendResetPasswordDemandEmail);
        sinon.assert.calledWith(mailService.sendResetPasswordDemandEmail, request.payload.data.attributes.email, hostBaseUrl, generatedToken);
      });

      it('should reply with serialized password reset demand when all went well', async () => {
        // given
        const generatedToken = 'token';
        userService.isUserExistingByEmail.resolves();
        resetPasswordService.generateTemporaryKey.returns(generatedToken);
        const resolvedPasswordReset = {
          attributes: {
            email: 'Giles75@hotmail.com',
            temporaryKey: 'one token',
            id: 15
          }
        };
        mailService.sendResetPasswordDemandEmail.resolves(resolvedPasswordReset);
        resetPasswordRepository.create.resolves(resolvedPasswordReset);
        passwordResetSerializer.serialize.resolves();

        // when
        await passwordController.createResetDemand(request, hFake);

        // then
        sinon.assert.calledWith(passwordResetSerializer.serialize, resolvedPasswordReset.attributes);
      });

      describe('When internal error has occured', () => {
        it('should reply with an serialized error', async () => {
          // given
          const error = new InternalError();
          const expectedErrorMessage = error.getErrorMessage();
          const serializedError = {};
          errorSerializer.serialize.returns(serializedError);
          userService.isUserExistingByEmail.rejects(error);

          //when
          const response = await passwordController.createResetDemand(request, hFake);

          // then
          sinon.assert.calledOnce(errorSerializer.serialize);
          sinon.assert.calledWith(errorSerializer.serialize, expectedErrorMessage);
          expect(response.source).to.deep.equal(serializedError);
        });
      });
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
      sinon.stub(UserRepository, 'findByEmail').resolves(fetchedUser);
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
        sinon.assert.calledOnce(UserRepository.findByEmail);
        sinon.assert.calledWith(UserRepository.findByEmail, fetchedPasswordResetDemand.email);
      });

      it('should reply with a serialized user with some fields', async () => {
        // given
        const serializedUser = {};
        resetPasswordService.verifyDemand.resolves(fetchedPasswordResetDemand);
        UserRepository.findByEmail.resolves(fetchedUser);
        userSerializer.serialize.returns(serializedUser);

        // when
        const response = await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(userSerializer.serialize);
        sinon.assert.calledWith(userSerializer.serialize, fetchedUser);
        expect(response).to.deep.equal(serializedUser);
      });

    });

    describe('When temporaryKey is not valid', () => {

      it('should reply with a InvalidTemporaryKeyError serialized', async () => {
        // given
        const error = new InvalidTemporaryKeyError();
        const expectedErrorMessage = error.getErrorMessage();
        const serializedError = {};
        errorSerializer.serialize.returns(serializedError);
        resetPasswordService.verifyDemand.rejects(error);

        // when
        const response = await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(errorSerializer.serialize);
        sinon.assert.calledWith(errorSerializer.serialize, expectedErrorMessage);
        expect(response.source).to.deep.equal(serializedError);
      });
    });

    describe('When temporaryKey is valid but not related to a password reset demand', () => {

      it('should reply with a PasswordResetDemandNotFoundError serialized', async () => {
        // given
        const error = new PasswordResetDemandNotFoundError();
        const expectedErrorMessage = error.getErrorMessage();
        const serializedError = {};
        errorSerializer.serialize.returns(serializedError);
        resetPasswordService.verifyDemand.rejects(error);

        // when
        const response = await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(errorSerializer.serialize);
        sinon.assert.calledWith(errorSerializer.serialize, expectedErrorMessage);
        expect(response.source).to.deep.equal(serializedError);
      });
    });

    describe('When unknown error has occured', () => {

      it('should reply with a InternalError serialized', async () => {
        // given
        const error = new InternalError();
        const expectedErrorMessage = error.getErrorMessage();
        const serializedError = {};
        errorSerializer.serialize.returns(serializedError);
        resetPasswordService.verifyDemand.rejects(error);

        // when
        const response = await passwordController.checkResetDemand(request, hFake);

        // then
        sinon.assert.calledOnce(errorSerializer.serialize);
        sinon.assert.calledWith(errorSerializer.serialize, expectedErrorMessage);
        expect(response.source).to.deep.equal(serializedError);
      });
    });

  });
});
