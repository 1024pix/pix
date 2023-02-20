import { expect, sinon, domainBuilder, HttpTestServer } from '../../../test-helper';
import moduleUnderTest from '../../../../lib/application/sco-organization-learners';
import usecases from '../../../../lib/domain/usecases';
import securityPreHandlers from '../../../../lib/application/security-pre-handlers';

import {
  NotFoundError,
  UserNotAuthorizedToUpdatePasswordError,
  UserNotAuthorizedToGenerateUsernamePasswordError,
} from '../../../../lib/domain/errors';

describe('Integration | Application | sco-organization-learners | sco-organization-learner-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'createAndReconcileUserToOrganizationLearner').rejects(new Error('not expected error'));
    sandbox.stub(usecases, 'updateOrganizationLearnerDependentUserPassword').rejects(new Error('not expected error'));
    sandbox.stub(usecases, 'generateUsernameWithTemporaryPassword').rejects(new Error('not expected error'));
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#createAndReconcileUserToOrganizationLearner', function () {
    const payload = { data: { attributes: {} } };

    beforeEach(function () {
      payload.data.attributes = {
        'first-name': 'Robert',
        'last-name': 'Smith',
        birthdate: '2012-12-12',
        'campaign-code': 'RESTRICTD',
        password: 'P@ssw0rd',
        username: 'robert.smith1212',
        'with-username': true,
      };
    });

    context('Success cases', function () {
      context('When email is used', function () {
        it('should return an HTTP response with status code 204', async function () {
          // given
          const createdUser = domainBuilder.buildUser();
          payload.data.attributes.email = 'toto@example.net';
          delete payload.data.attributes.username;
          payload.data.attributes['with-username'] = false;
          usecases.createAndReconcileUserToOrganizationLearner.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/sco-organization-learners/dependent', payload);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

      context('When username is used', function () {
        it('should return an HTTP response with status code 204', async function () {
          // given
          const createdUser = domainBuilder.buildUser();
          delete payload.data.attributes.email;
          payload.data.attributes.username = 'robert.smith1212';
          payload.data.attributes['with-username'] = true;
          usecases.createAndReconcileUserToOrganizationLearner.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/sco-organization-learners/dependent', payload);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });
    });

    context('Error cases', function () {
      context('when a NotFoundError is thrown', function () {
        it('should resolve a 404 HTTP response', async function () {
          // given
          delete payload.data.attributes.username;
          usecases.createAndReconcileUserToOrganizationLearner.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/sco-organization-learners/dependent', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

  describe('#updatePassword', function () {
    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';

    beforeEach(function () {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) =>
        h.response(true)
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
        usecases.updateOrganizationLearnerDependentUserPassword.resolves(generatedPassword);

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/sco-organization-learners/password-update',
          payload,
          auth
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
            auth
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
            auth
          );

          // then
          expect(response.statusCode).to.equal(403);
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
        h.response(true)
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
        usecases.generateUsernameWithTemporaryPassword.resolves({ username, generatedPassword });

        // when
        const response = await httpTestServer.request(
          'POST',
          '/api/sco-organization-learners/username-password-generation',
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
            '/api/sco-organization-learners/username-password-generation',
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
