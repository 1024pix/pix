import { passwordController } from '../../../../../src/identity-access-management/application/password/password.controller.js';
import { identityAccessManagementRoutes } from '../../../../../src/identity-access-management/application/routes.js';
import { PasswordResetDemandNotFoundError } from '../../../../../src/identity-access-management/domain/errors.js';
import { usecases } from '../../../../../src/identity-access-management/domain/usecases/index.js';
import { UserNotFoundError } from '../../../../../src/shared/domain/errors.js';
import { InvalidTemporaryKeyError } from '../../../../../src/shared/domain/errors.js';
import {
  catchErr,
  databaseBuilder,
  domainBuilder,
  expect,
  hFake,
  HttpTestServer,
  sinon,
} from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Application | Controller | password', function () {
  describe('#createResetPasswordDemand', function () {
    const email = 'user@example.net';
    const headers = {
      'accept-language': 'fr',
    };
    const payload = {
      data: {
        type: 'password-reset-demands',
        attributes: { email },
      },
    };

    it('returns a 201 HTTP status code with a response', async function () {
      // given
      const request = { headers, payload };

      const userId = databaseBuilder.factory.buildUser({ email }).id;
      databaseBuilder.factory.buildAuthenticationMethod.withPixAsIdentityProviderAndHashedPassword({ userId });
      await databaseBuilder.commit();

      // when
      const response = await passwordController.createResetPasswordDemand(request, hFake);

      // then
      expect(response.statusCode).to.equal(201);
      sinon.assert.match(response.source, {
        data: {
          attributes: {
            email: 'user@example.net',
          },
          id: sinon.match.string,
          type: 'password-reset-demands',
        },
      });
    });

    context('when user account does not exist with given email', function () {
      it('throws a UserNotFoundError', async function () {
        // given
        const request = { headers, payload };

        // when
        const error = await catchErr(passwordController.createResetPasswordDemand)(request, hFake);

        // then
        expect(error).to.be.instanceOf(UserNotFoundError);
      });
    });
  });

  describe('#checkResetDemand', function () {
    let routesUnderTest;
    let httpTestServer;
    let user;
    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';
    const email = 'user@example.net';

    beforeEach(async function () {
      sinon.stub(usecases, 'getUserByResetPasswordDemand');
      user = domainBuilder.buildUser({ email });
      routesUnderTest = identityAccessManagementRoutes[0];
      httpTestServer = new HttpTestServer();
      await httpTestServer.register(routesUnderTest);
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.getUserByResetPasswordDemand.resolves(user);

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.type).to.equal('users');
        expect(response.result.data.id).to.equal(user.id.toString());
        expect(response.result.data.attributes.email).to.equal(email);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 401 when InvalidTemporaryKeyError', async function () {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new InvalidTemporaryKeyError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond an HTTP response with status code 404 when PasswordResetDemandNotFoundError', async function () {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new PasswordResetDemandNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async function () {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
