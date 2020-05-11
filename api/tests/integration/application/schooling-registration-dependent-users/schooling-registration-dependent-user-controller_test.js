const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/schooling-registration-dependent-users');

const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const { NotFoundError, UserNotAuthorizedToUpdatePasswordError } = require('../../../../lib/domain/errors');

describe('Integration | Application | Schooling-registration-dependent-users | schooling-registration-dependent-user-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'createAndAssociateUserToSchoolingRegistration').rejects(new Error('not expected error'));
    sandbox.stub(usecases, 'updateSchoolingRegistrationDependentUserPassword').rejects(new Error('not expected error'));
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#createAndAssociateUserToSchoolingRegistration', () => {

    const payload = { data: { attributes: {} } };

    beforeEach(() => {
      payload.data.attributes = {
        'first-name': 'Robert',
        'last-name': 'Smith',
        'birthdate': '2012-12-12',
        'campaign-code': 'RESTRICTD',
        'password': 'P@ssw0rd',
      };
    });

    context('Success cases', () => {

      const createdUser = domainBuilder.buildUser();

      context('When email is used', () => {

        it('should return an HTTP response with status code 201', async () => {
          // given
          payload.data.attributes.email = 'toto@example.net';
          payload.data.attributes['with-username'] = false;
          usecases.createAndAssociateUserToSchoolingRegistration.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.equal(createdUser.id.toString());
        });
      });

      context('When username is used', () => {

        it('should return an HTTP response with status code 201', async () => {
          // given
          payload.data.attributes.username = 'robert.smith1212';
          payload.data.attributes['with-username'] = true;
          usecases.createAndAssociateUserToSchoolingRegistration.resolves(createdUser);

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(201);
          expect(response.result.data.id).to.equal(createdUser.id.toString());
        });
      });

    });

    context('Error cases', () => {

      context('when a NotFoundError is thrown', () => {

        it('should resolve a 404 HTTP response', async () => {
          // given
          usecases.createAndAssociateUserToSchoolingRegistration.rejects(new NotFoundError());

          // when
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(404);
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
        'organization-id': 3
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
