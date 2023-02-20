import { sinon, expect, hFake } from '../../../test-helper';
import passwordResetSerializer from '../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer';
import userSerializer from '../../../../lib/infrastructure/serializers/jsonapi/user-serializer';
import usecases from '../../../../lib/domain/usecases';
import passwordController from '../../../../lib/application/passwords/password-controller';

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
