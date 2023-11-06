import { domainBuilder, expect, sinon, HttpTestServer } from '../../../test-helper.js';

import { PasswordResetDemandNotFoundError, UserNotFoundError } from '../../../../lib/domain/errors.js';

import { usecases } from '../../../../lib/domain/usecases/index.js';
import * as moduleUnderTest from '../../../../lib/application/passwords/index.js';
import { ForbiddenAccess, InvalidTemporaryKeyError } from '../../../../src/shared/domain/errors.js';

describe('Integration | Application | Passwords | password-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'createPasswordResetDemand');
    sinon.stub(usecases, 'getUserByResetPasswordDemand');
    sinon.stub(usecases, 'updateExpiredPassword');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#createResetDemand', function () {
    const email = 'user@example.net';
    const temporaryKey = 'ABCDEF123';

    const method = 'POST';
    const url = '/api/password-reset-demands';
    const headers = {
      'accept-language': 'fr',
    };
    const payload = {
      data: {
        type: 'password-reset-demands',
        attributes: { email },
      },
    };

    context('Success cases', function () {
      it('should return an HTTP response with status code 201', async function () {
        // given
        const resetPasswordDemand = {
          attributes: {
            id: 1,
            email,
            temporaryKey,
          },
        };
        const expectedResult = {
          data: {
            id: '1',
            type: 'password-reset-demands',
            attributes: { email },
          },
        };
        usecases.createPasswordResetDemand.resolves(resetPasswordDemand);

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(201);
        expect(response.result).to.deep.equal(expectedResult);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 404 when UserNotFoundError', async function () {
        // given
        usecases.createPasswordResetDemand.throws(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('#checkResetDemand', function () {
    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    const email = 'user@example.net';

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    const user = domainBuilder.buildUser({ email });

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

  describe('#updateExpiredPassword', function () {
    const method = 'POST';
    const url = '/api/expired-password-updates';
    const payload = {
      data: {
        type: 'organization-invitations',
        attributes: {
          'password-reset-token': 'PASSWORD_RESET_TOKEN',
          'new-password': 'Password02',
        },
      },
    };

    context('Success cases', function () {
      it('should return an HTTP response with status code 201', async function () {
        // given
        usecases.updateExpiredPassword.resolves();

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', function () {
      it('should respond an HTTP response with status code 404 when UserNotFoundError', async function () {
        // given
        usecases.updateExpiredPassword.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 403 when ForbiddenAccess', async function () {
        // given
        usecases.updateExpiredPassword.rejects(new ForbiddenAccess());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });
  });
});
