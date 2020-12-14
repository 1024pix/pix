const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/schooling-registration-dependent-users');

const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const { NotFoundError, UserNotAuthorizedToUpdatePasswordError, UserNotAuthorizedToGenerateUsernamePasswordError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Schooling-registration-dependent-users | schooling-registration-dependent-user-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'createAndReconcileUserToSchoolingRegistration').rejects(new Error('not expected error'));
    sandbox.stub(usecases, 'updateSchoolingRegistrationDependentUserPassword').rejects(new Error('not expected error'));
    sandbox.stub(usecases, 'generateUsernameWithTemporaryPassword').resolves();
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#createAndReconcileUserToSchoolingRegistration', () => {

    const payload = { data: { attributes: {} } };

    beforeEach(() => {
      payload.data.attributes = {
        'first-name': 'Robert',
        'last-name': 'Smith',
        'birthdate': '2012-12-12',
        'campaign-code': 'RESTRICTD',
        'password': 'P@ssw0rd',
        'username': 'robert.smith1212',
        'with-username': true,
      };
    });

    context('Success cases', () => {

      const createdUser = domainBuilder.buildUser();

      context('When email is used', () => {

        it('should return an HTTP response with status code 204', async () => {
          // given
          payload.data.attributes.email = 'toto@example.net';
          delete payload.data.attributes.username;
          payload.data.attributes['with-username'] = false;
          usecases.createAndReconcileUserToSchoolingRegistration.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

      context('When username is used', () => {

        it('should return an HTTP response with status code 204', async () => {
          // given
          delete payload.data.attributes.email;
          payload.data.attributes.username = 'robert.smith1212';
          payload.data.attributes['with-username'] = true;
          usecases.createAndReconcileUserToSchoolingRegistration.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(204);
        });
      });

    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          delete payload.data.attributes.username;
          usecases.createAndReconcileUserToSchoolingRegistration.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

  describe('#createUserAndReconcileToSchoolingRegistrationFromExternalUser', () => {

    const payload = { data: { attributes: {} } };

    beforeEach(() => {
      sandbox.stub(usecases, 'createUserAndReconcileToSchoolingRegistrationFromExternalUser').rejects();
      payload.data.attributes = {
        'campaign-code': 'RESTRICTD',
        'external-user-token': 'external-user-token',
        'birthdate': '1948-12-21',
        'access-token': null,
      };
    });

    context('Success cases', () => {

      const createdUser = domainBuilder.buildUser();

      it('should return an HTTP response with status code 200 and access-token in payload', async () => {
        // given
        usecases.createUserAndReconcileToSchoolingRegistrationFromExternalUser.resolves(createdUser);

        // when
        const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/external-user-token', payload);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['access-token']).to.not.be.empty;
      });

    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          usecases.createUserAndReconcileToSchoolingRegistrationFromExternalUser.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/external-usertoken', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

  describe('#generateUsernameWithTemporaryPassword', () => {

    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';
    const username = 'john.harry0207';

    beforeEach(() => {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => h.response(true));
      payload.data.attributes = {
        'schooling-registration-id': 1,
        'organization-id': 3,
      };
      auth.credentials.userId = domainBuilder.buildUser().id;
    });

    context('Success cases', () => {

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.generateUsernameWithTemporaryPassword.resolves({ username, generatedPassword });

        // when
        const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/generate-username-password', payload, auth);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['username']).to.equal(username);
        expect(response.result.data.attributes['generated-password']).to.equal(generatedPassword);
      });
    });

    context('Error cases', () => {

      context('when the student has not access to the organization an error is thrown', () => {

        it('should resolve a 403 HTTP response', async () => {
          // given
          usecases.generateUsernameWithTemporaryPassword.rejects(new UserNotAuthorizedToGenerateUsernamePasswordError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/generate-username-password', payload, auth);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

  describe('#updatePassword', () => {

    const payload = { data: { attributes: {} } };
    const auth = { credentials: {}, strategy: {} };
    const generatedPassword = 'Passw0rd';

    beforeEach(() => {
      securityPreHandlers.checkUserBelongsToScoOrganizationAndManagesStudents.callsFake((request, h) => h.response(true));

      payload.data.attributes = {
        'schooling-registration-id': 1,
        'organization-id': 3,
      };

      auth.credentials.userId = domainBuilder.buildUser().id;
    });

    context('Success cases', () => {

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.updateSchoolingRegistrationDependentUserPassword.resolves(generatedPassword);

        // when
        const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/password-update', payload, auth);

        // then
        expect(response.statusCode).to.equal(200);
        expect(response.result.data.attributes['generated-password']).to.equal(generatedPassword);
      });
    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          usecases.updateSchoolingRegistrationDependentUserPassword.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/password-update', payload, auth);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });

      context('when a UserNotAuthorizedToUpdatePasswordError is thrown', () => {

        it('should resolve a 403 HTTP response', async () => {
          // given
          usecases.updateSchoolingRegistrationDependentUserPassword.rejects(new UserNotAuthorizedToUpdatePasswordError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users/password-update', payload, auth);

          // then
          expect(response.statusCode).to.equal(403);
        });
      });
    });
  });

});
