const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const { ForbiddenAccess, UserNotFoundError, PasswordNotMatching } = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/passwords');

describe('Integration | Application | Passwords | password-controller', () => {

  let httpTestServer;

  beforeEach(() => {
    sinon.stub(usecases, 'updateExpiredPassword');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  describe('#updateExpiredPassword', () => {

    const method = 'POST';
    const url = '/api/expired-password-updates';
    const payload = {
      data: {
        type: 'organization-invitations',
        attributes: {
          username: 'firstName.lastName0512',
          expiredPassword: 'expiredPassword01',
          newPassword: 'newPassword02'
        },
      }
    };

    context('Success cases', () => {

      it('should return an HTTP response with status code 201', async () => {
        // given
        usecases.updateExpiredPassword.resolves();

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

    context('Error cases', () => {

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async () => {
        // given
        usecases.updateExpiredPassword.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 500 when PasswordNotMatching', async () => {
        // given
        usecases.updateExpiredPassword.rejects(new PasswordNotMatching());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(500);
      });

      it('should respond an HTTP response with status code 403 when ForbiddenAccess', async () => {
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
