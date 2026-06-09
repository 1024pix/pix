import sinon from 'sinon';

import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { expect } from '../../../../test-helper.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Identity Access Management | Application | Controller | password', function () {
  describe('#checkResetDemand', function () {
    const email = 'user@example.net';
    const temporaryKey = 'ABCDEF123';

    const request = {
      params: { temporaryKey },
    };
    let dependencies;

    beforeEach(function () {
      sinon.stub(usecases, 'getUserByResetPasswordDemand');
      usecases.getUserByResetPasswordDemand.resolves({ email });
    });

    it('returns serialized user', async function () {
      // when
      const result = await passwordController.checkResetDemand(request, hFake, dependencies);

      // then
      expect(usecases.getUserByResetPasswordDemand).to.have.been.calledWithExactly({ temporaryKey });
      expect(result.data.attributes.email).to.equal(email);
    });
  });

  describe('#createResetPasswordDemand', function () {
    const email = 'user@example.net';
    const locale = 'fr-FR';
    const temporaryKey = 'ABCDEF123';
    const request = {
      payload: { email },
      state: { locale },
    };
    const resetPasswordDemand = {
      id: 1,
      email,
      temporaryKey,
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createResetPasswordDemand');
      usecases.createResetPasswordDemand.resolves(resetPasswordDemand);
    });

    context('when all went well', function () {
      it('returns a 204 HTTP status code', async function () {
        // when
        const response = await passwordController.createResetPasswordDemand(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
        expect(usecases.createResetPasswordDemand).to.have.been.calledWithExactly({
          email,
          locale,
        });
      });
    });
  });

  describe('#updateExpiredPassword', function () {
    it('returns 201 http status code', async function () {
      // given
      const request = {
        payload: {
          data: {
            attributes: {
              'password-reset-token': 'PASSWORD_EXPIRATION_TOKEN',
              'new-password': 'Password123',
            },
          },
        },
      };
      sinon.stub(usecases, 'updateExpiredPassword');
      usecases.updateExpiredPassword
        .withArgs({
          passwordExpirationToken: 'PASSWORD_EXPIRATION_TOKEN',
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
