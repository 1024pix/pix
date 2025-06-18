import * as moduleUnderTest from '../../../../../src/prescription/organization-learner/application/sco-organization-learner-route.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { securityPreHandlers } from '../../../../../src/shared/application/security-pre-handlers.js';
import { NotFoundError, UserNotAuthorizedToUpdatePasswordError } from '../../../../../src/shared/domain/errors.js';
import { UserNotAuthorizedToGenerateUsernamePasswordError } from '../../../../../src/shared/domain/errors.js';
import { domainBuilder, expect, HttpTestServer, sinon } from '../../../../test-helper.js';

describe('Integration | Application | Controller | sco-organization-learners', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'updateOrganizationLearnerDependentUserPassword').rejects(new Error('not expected error'));
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#updatePassword', function () {
    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';

    beforeEach(function () {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) =>
        h.response(true),
      );

      payload.data.attributes = {
        'organization-learner-id': 1,
        'organization-id': 3,
      };

      auth.credentials.userId = domainBuilder.buildUser().id;
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        usecases.updateOrganizationLearnerDependentUserPassword.resolves({
          generatedPassword,
          organizationLearnersId: 1,
        });

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/sco-organization-learners/password-update',
          payload,
          auth,
        );

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['generated-password']).to.equal(generatedPassword);
      });
    });

    context('Error cases', function () {
      context('when a NotFoundError is thrown', function () {
        it('should resolve a 404 HTTP response', async function () {
          // given
          usecases.updateOrganizationLearnerDependentUserPassword.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/sco-organization-learners/password-update',
            payload,
            auth,
          );

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when a UserNotAuthorizedToUpdatePasswordError is thrown', function () {
        it('should resolve a 403 HTTP response', async function () {
          // given
          usecases.updateOrganizationLearnerDependentUserPassword.rejects(new UserNotAuthorizedToUpdatePasswordError());

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/sco-organization-learners/password-update',
            payload,
            auth,
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#batchGenerateOrganizationLearnersUsernameWithTemporaryPassword', function () {
    context('Error cases', function () {
      context('when an UserNotAuthorizedToUpdatePasswordError error is thrown ', function () {
        it('resolves a 403 Http Response with code and message in payload', async function () {
          // given
          const userId = 100000;
          const organizationId = 100001;
          const organizationLearnersId = [100002, 100003];
          const message = `User ${userId} does not have permissions to update passwords of students in organization ${organizationId}`;
          const code = 'ORGANIZATION_LEARNER_WITHOUT_USERNAME';
          const expectedErrorResult = {
            code,
            detail: message,
            status: '403',
            title: 'Forbidden',
          };

          securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) =>
            h.response(true),
          );
          const payload = {
            data: {
              attributes: {
                'organization-learners-id': organizationLearnersId,
                'organization-id': organizationId,
              },
            },
          };
          const auth = {
            credentials: {
              userId: userId,
            },
            strategy: {},
          };

          sinon
            .stub(usecases, 'generateOrganizationLearnersUsernameAndTemporaryPassword')
            .rejects(new UserNotAuthorizedToUpdatePasswordError(message, code));

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/sco-organization-learners/batch-username-password-generate',
            payload,
            auth,
          );
          // then
          expect(response.statusCode).to.equal(403);
          expect(response.result.errors[0]).to.deep.equal(expectedErrorResult);
        });
      });
    });
  });

  describe('#generateUsernameWithTemporaryPassword', function () {
    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';
    const username = 'john.harry0207';

    beforeEach(function () {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) =>
        h.response(true),
      );
      payload.data.attributes = {
        'organization-learner-id': 1,
        'organization-id': 3,
      };
      auth.credentials.userId = domainBuilder.buildUser().id;
    });

    context('Success cases', function () {
      it('should return an HTTP response with status code 200', async function () {
        // given
        sinon.stub(usecases, 'generateUsernameWithTemporaryPassword').resolves({ username, generatedPassword });

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/sco-organization-learners/username-password-generation',
          payload,
          auth,
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
          sinon
            .stub(usecases, 'generateUsernameWithTemporaryPassword')
            .rejects(new UserNotAuthorizedToGenerateUsernamePasswordError());

          // when
          const response = await httpTestServer.request(
            'POST',
            '/api/sco-organization-learners/username-password-generation',
            payload,
            auth,
          );

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });
});
