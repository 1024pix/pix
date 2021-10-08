const { sinon, expect, hFake } = require('../../../test-helper');

const passwordResetSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');
const userSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-serializer');

const usecases = require('../../../../lib/domain/usecases');

const passwordController = require('../../../../lib/application/passwords/password-controller');

describe('Unit | Controller | PasswordController', function () {
  describe('#createResetDemand', function () {
    const email = 'user@example.net';
    const locale = 'fr';
    const temporaryKey = 'ABCDEF123';

    const request = {
      headers: {
        'accept-language': locale,
      },
      payload: {
        data: {
          attributes: { email },
        },
      },
    };

    const resetPasswordDemand = {
      attributes: {
        id: 1,
        email,
        temporaryKey,
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createPasswordResetDemand');
      sinon.stub(passwordResetSerializer, 'serialize');

      usecases.createPasswordResetDemand.resolves(resetPasswordDemand);
      passwordResetSerializer.serialize.returns();
    });

    it('should reply with serialized password reset demand when all went well', async function () {
      // when
      const response = await passwordController.createResetDemand(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
      expect(usecases.createPasswordResetDemand).to.have.been.calledWith({
        email,
        locale,
      });
      expect(passwordResetSerializer.serialize).to.have.been.calledWith(resetPasswordDemand.attributes);
    });
  });

  describe('#checkResetDemand', function () {
    const email = 'user@example.net';
    const temporaryKey = 'ABCDEF123';

    const request = {
      params: { temporaryKey },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'getUserByResetPasswordDemand');
      sinon.stub(userSerializer, 'serialize');

      usecases.getUserByResetPasswordDemand.resolves({ email });
    });

    it('should return serialized user', async function () {
      // when
      await passwordController.checkResetDemand(request, hFake);

      // then
      expect(usecases.getUserByResetPasswordDemand).to.have.been.calledWith({ temporaryKey });
      expect(userSerializer.serialize).to.have.been.calledWith({ email });
    });
  });

  describe('#updateExpiredPassword', function () {
    const request = {
      payload: {
        data: {
          attributes: {
            username: 'uzinagaz.hheer1206',
            expiredPassword: 'expiredPassword01',
            newPassword: 'Password123',
          },
        },
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'updateExpiredPassword');
    });

    it('should return 201 http status code', async function () {
      // given
      usecases.updateExpiredPassword.resolves();

      // when
      const response = await passwordController.updateExpiredPassword(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
    });
  });
});
