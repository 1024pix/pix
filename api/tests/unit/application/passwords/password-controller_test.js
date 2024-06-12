import { passwordController } from '../../../../lib/application/passwords/password-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { expect, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Controller | PasswordController', function () {
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
      expect(usecases.getUserByResetPasswordDemand).to.have.been.calledWithExactly({ temporaryKey });
      expect(dependencies.userSerializer.serialize).to.have.been.calledWithExactly({ email });
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
