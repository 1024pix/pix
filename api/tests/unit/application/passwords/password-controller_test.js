const { sinon, hFake } = require('../../../test-helper');

const passwordController = require('../../../../lib/application/passwords/password-controller');

const usecases = require('../../../../lib/domain/usecases');
const passwordResetDemandSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/password-reset-demand-serializer');
const passwordResetSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/password-reset-serializer');

describe('Unit | Controller | Password', () => {

  describe('#createPasswordResetDemand', () => {
    const email = 'shi@fu.me';

    const request = {
      payload: {
        data: {
          attributes: {
            email,
          },
        },
      },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'createPasswordResetDemand');
      sinon.stub(passwordResetDemandSerializer, 'serialize');
    });

    it('should reply with serialized password reset demand', async () => {
      // given
      const temporaryKey = 'temporaryKey';
      const passwordResetDemand = { id: 1, email, temporaryKey };
      const serializedPasswordResetDemand = { attributes: passwordResetDemand };

      usecases.createPasswordResetDemand.resolves(serializedPasswordResetDemand);

      // when
      await passwordController.createPasswordResetDemand(request, hFake);

      // then
      sinon.assert.calledWith(usecases.createPasswordResetDemand, { email });
      sinon.assert.calledWith(passwordResetDemandSerializer.serialize, passwordResetDemand);
    });
  });

  describe('#createPasswordReset', () => {
    const temporaryKey = 'temporaryKey';
    const password = 'password';
    const request = {
      payload: {
        data: {
          attributes: {
            'temporary-key': temporaryKey,
            password,
          },
        },
      },
    };

    beforeEach(() => {
      sinon.stub(usecases, 'resetPassword');
      sinon.stub(passwordResetSerializer, 'serialize');
    });

    it('should reply with serialized password reset', async () => {
      // given
      const passwordReset = { password, 'temporary-key': temporaryKey };
      const serializedPasswordReset = { attributes: passwordReset };

      usecases.resetPassword.resolves(serializedPasswordReset);

      // when
      await passwordController.createPasswordReset(request, hFake);

      // then
      sinon.assert.calledWith(usecases.resetPassword, { password, temporaryKey });
      sinon.assert.calledWith(passwordResetSerializer.serialize, { password, temporaryKey });
    });

  });
});
