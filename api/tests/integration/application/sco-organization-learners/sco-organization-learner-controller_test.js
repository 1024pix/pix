const { expect, sinon, domainBuilder, HttpTestServer } = require('../../../test-helper');

const moduleUnderTest = require('../../../../lib/application/sco-organization-learners');

const usecases = require('../../../../lib/domain/usecases');
const securityPreHandlers = require('../../../../lib/application/security-pre-handlers');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Application | sco-organization-learners | sco-organization-learner-controller', function () {
  let sandbox;
  let httpTestServer;

  beforeEach(async function () {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'createAndReconcileUserToOrganizationLearner').rejects(new Error('not expected error'));
    sandbox.stub(securityPreHandlers, 'checkUserBelongsToScoOrganizationAndManagesStudents');
    httpTestServer = new HttpTestServer();
    await httpTestServer.register(moduleUnderTest);
  });

  afterEach(function () {
    sandbox.restore();
  });

  describe('#createAndReconcileUserToOrganizationLearner for api/schooling-registration-dependent-users', function () {
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
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

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
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

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
          const response = await httpTestServer.request('POST', '/api/schooling-registration-dependent-users', payload);

          // then
          expect(response.statusCode).to.equal(404);
        });
      });
    });
  });

  describe('#createAndReconcileUserToOrganizationLearner for api/sco-organization-learners/dependent', function () {
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
});
