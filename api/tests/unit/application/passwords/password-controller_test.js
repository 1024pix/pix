const { sinon, expect, hFake } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases/index.js');

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

    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'createPasswordResetDemand');

      const passwordResetSerializerStub = {
        serialize: sinon.stub(),
      };

      usecases.createPasswordResetDemand.resolves(resetPasswordDemand);
      passwordResetSerializerStub.serialize.returns();

      dependencies = {
        passwordResetSerializer: passwordResetSerializerStub,
      };
    });

    it('should reply with serialized password reset demand when all went well', async function () {
      // when
      const response = await passwordController.createResetDemand(request, hFake, dependencies);

      // then
      expect(response.statusCode).to.equal(201);
      expect(usecases.createPasswordResetDemand).to.have.been.calledWith({
        email,
        locale,
      });
      expect(dependencies.passwordResetSerializer.serialize).to.have.been.calledWith(resetPasswordDemand.attributes);
    });
  });

  describe('#checkResetDemand', function () {
    const email = 'user@example.net';
    const temporaryKey = 'ABCDEF123';

    const request = {
      params: { temporaryKey },
    };
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'getUserByResetPasswordDemand');
      const userSerializerStub = {
        serialize: sinon.stub(),
      };
      dependencies = {
        userSerializer: userSerializerStub,
      };
      usecases.getUserByResetPasswordDemand.resolves({ email });
    });

    it('should return serialized user', async function () {
      // when
      await passwordController.checkResetDemand(request, hFake, dependencies);

      // then
      expect(usecases.getUserByResetPasswordDemand).to.have.been.calledWith({ temporaryKey });
      expect(dependencies.userSerializer.serialize).to.have.been.calledWith({ email });
    });
  });

  describe('#updateExpiredPassword', function () {
    it('should return 201 http status code', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              'password-reset-token': 'PASSWORD_RESET_TOKEN',
              'new-password': 'Password123',
            },
          },
        },
      };
      sinon.stub(usecases, 'updateExpiredPassword');
      usecases.updateExpiredPassword
        .withArgs({
          passwordResetToken: 'PASSWORD_RESET_TOKEN',
          newPassword: 'Password123',
        })
        .resolves('beth.rave1221');

      // when
      const response = await passwordController.updateExpiredPassword(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.source).to.deep.equal({
        data: {
          type: 'reset-expired-password-demands',
          attributes: {
            login: 'beth.rave1221',
          },
        },
      });
    });
  });
});
