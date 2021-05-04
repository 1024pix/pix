const { domainBuilder, expect, sinon, HttpTestServer } = require('../../../test-helper');

const {
  ForbiddenAccess,
  InvalidTemporaryKeyError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  UserNotFoundError,
} = require('../../../../lib/domain/errors');
const usecases = require('../../../../lib/domain/usecases');

const moduleUnderTest = require('../../../../lib/application/passwords');

describe('Integration | Application | Passwords | password-controller', () => {

  let httpTestServer;

  beforeEach(async() => {
    sinon.stub(usecases, 'createPasswordResetDemand');
    sinon.stub(usecases, 'getUserByResetPasswordDemand');
    sinon.stub(usecases, 'updateExpiredPassword');

    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  describe('#createResetDemand', () => {

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

    context('Success cases', () => {

      it('should return an HTTP response with status code 201', async () => {
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

    context('Error cases', () => {

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async () => {
        // given
        usecases.createPasswordResetDemand.throws(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url, payload, null, headers);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });

  describe('#checkResetDemand', () => {

    const method = 'GET';
    const url = '/api/password-reset-demands/ABCDEF123';

    const email = 'user@example.net';

    const user = domainBuilder.buildUser({ email });

    context('Success cases', () => {

      it('should return an HTTP response with status code 200', async () => {
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

    context('Error cases', () => {

      it('should respond an HTTP response with status code 401 when InvalidTemporaryKeyError', async () => {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new InvalidTemporaryKeyError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(401);
      });

      it('should respond an HTTP response with status code 404 when PasswordResetDemandNotFoundError', async () => {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new PasswordResetDemandNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });

      it('should respond an HTTP response with status code 404 when UserNotFoundError', async () => {
        // given
        usecases.getUserByResetPasswordDemand.rejects(new UserNotFoundError());

        // when
        const response = await httpTestServer.request(method, url);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
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
          newPassword: 'newPassword02',
        },
      },
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

      it('should respond an HTTP response with status code 401 when PasswordNotMatching', async () => {
        // given
        usecases.updateExpiredPassword.rejects(new PasswordNotMatching());

        // when
        const response = await httpTestServer.request(method, url, payload);

        // then
        expect(response.statusCode).to.equal(401);
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
