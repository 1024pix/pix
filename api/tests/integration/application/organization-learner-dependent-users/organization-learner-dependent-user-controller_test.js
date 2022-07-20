const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/organization-learner-dependent-users');

const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const {
  UserNotAuthorizedToGenerateUsernamePasswordError,
} = require('../../../../lib/domain/errors');

describe('Integration | Application | organization-learner-dependent-users | organization-learner-dependent-user-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'generateUsernameWithTemporaryPassword').resolves();
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#generateUsernameWithTemporaryPassword', function () {
    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';
    const username = 'john.harry0207';

    beforeEach(function () {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) =>
        h.response(true)
      );
      payload.data.attributes = {
        'schooling-registration-id': 1,
        'organization-id': 3,
      };
      auth.credentials.userId = domainBuilder.buildUser().id;
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.generateUsernameWithTemporaryPassword.resolves({ username, generatedPassword });

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/schooling-registration-dependent-users/generate-username-password',
          payload,
          auth
        );

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['username']).to.equal(username);
        expect(response.result.data.attributes['generated-password']).to.equal(generatedPassword);
      });
    });

    context('Error cases', function () {
      context('when the student has not access to the organization an error is thrown', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          usecases.generateUsernameWithTemporaryPassword.rejects(
            new UserNotAuthorizedToGenerateUsernamePasswordError()
          );

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/schooling-registration-dependent-users/generate-username-password',
            payload,
            auth
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
