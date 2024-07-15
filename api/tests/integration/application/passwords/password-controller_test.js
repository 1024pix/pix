import * as moduleUnderTest from '../../../../lib/application/passwords/index.js';
import { UserNotFoundError } from '../../../../lib/domain/errors.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { ForbiddenAccess } from '../../../../src/shared/domain/errors.js';
import { expect, HttpTestServer, sinon } from '../../../test-helper.js';

describe('Integration | Application | Passwords | password-controller', function () {
  let httpTestServer;

  beforeEach(async function () {
    sinon.stub(usecases, 'updateExpiredPassword');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
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
