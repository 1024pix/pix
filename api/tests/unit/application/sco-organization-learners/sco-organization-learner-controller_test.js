const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const scoOrganizationLearnerController = require('../../../../lib/application/sco-organization-learners/sco-organization-learner-controller');
const scoOrganizationLearnerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/sco-organization-learner-serializer');
const organizationLearnerUserAssociationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

describe('Unit | Application | Controller | sco-organization-learner', function () {
  describe('#reconcileScoOrganizationLearnerManually', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
      query: { withReconciliation: true },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'reconcileScoOrganizationLearnerManually');
      usecases.reconcileScoOrganizationLearnerManually.resolves();
      sinon.stub(scoOrganizationLearnerSerializer, 'serializeIdentity');
      scoOrganizationLearnerSerializer.serializeIdentity.resolves();
      sinon.stub(organizationLearnerUserAssociationSerializer, 'serialize');
      organizationLearnerUserAssociationSerializer.serialize.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations',
      };
      const response = await scoOrganizationLearnerController.reconcileScoOrganizationLearnerManually(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/sco-organization-learners/association; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/association',
      };
      const response = await scoOrganizationLearnerController.reconcileScoOrganizationLearnerManually(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#reconcileScoOrganizationLearnerAutomatically', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'reconcileScoOrganizationLearnerAutomatically');
      usecases.reconcileScoOrganizationLearnerAutomatically.resolves();
      sinon.stub(scoOrganizationLearnerSerializer, 'serializeIdentity');
      scoOrganizationLearnerSerializer.serializeIdentity.resolves();
      sinon.stub(organizationLearnerUserAssociationSerializer, 'serialize');
      organizationLearnerUserAssociationSerializer.serialize.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations/auto',
      };
      const response = await scoOrganizationLearnerController.reconcileScoOrganizationLearnerAutomatically(
        request,
        hFake
      );

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/sco-organization-learners/association/auto; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/association/auto',
      };
      const response = await scoOrganizationLearnerController.reconcileScoOrganizationLearnerAutomatically(
        request,
        hFake
      );

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#generateUsername', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'generateUsername');
      usecases.generateUsername.resolves();
      sinon.stub(scoOrganizationLearnerSerializer, 'serializeWithUsernameGeneration');
      scoOrganizationLearnerSerializer.serializeWithUsernameGeneration.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations/possibilities',
      };
      const response = await scoOrganizationLearnerController.generateUsername(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/sco-organization-learners/possibilities; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/possibilities',
      };
      const response = await scoOrganizationLearnerController.generateUsername(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#createAndReconcileUserToOrganizationLearner', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createAndReconcileUserToOrganizationLearner');
      usecases.createAndReconcileUserToOrganizationLearner.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-dependent-users',
      };
      const response = await scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner(
        request,
        hFake
      );

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/sco-organization-learners/dependent; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/dependent',
      };
      const response = await scoOrganizationLearnerController.createAndReconcileUserToOrganizationLearner(
        request,
        hFake
      );

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#createUserAndReconcileToOrganizationLearnerFromExternalUser', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'createUserAndReconcileToOrganizationLearnerFromExternalUser');
      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves();
    });

    it('should return 200 response with an access token', async function () {
      // given
      hFake.request = { path: {} };
      request = {
        payload: {
          data: {
            attributes: {
              birthdate: '01-01-2000',
              'campaign-code': 'BADGES123',
              'external-user-token': '123SamlId',
            },
          },
        },
      };
      const token = Symbol('token');

      usecases.createUserAndReconcileToOrganizationLearnerFromExternalUser.resolves(token);

      // when
      const response =
        await scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser(
          request,
          hFake
        );

      // then
      expect(response.source.data.attributes['access-token']).to.deep.equal(token);
      expect(response.statusCode).to.equal(200);
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-dependent-users/external-user-token',
      };
      const response =
        await scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser(
          request,
          hFake
        );

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/sco-organization-learners/external; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/external',
      };
      const response =
        await scoOrganizationLearnerController.createUserAndReconcileToOrganizationLearnerFromExternalUser(
          request,
          hFake
        );

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#updatePassword', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'updateOrganizationLearnerDependentUserPassword');
      usecases.updateOrganizationLearnerDependentUserPassword.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-dependent-users/password-update',
      };
      const response = await scoOrganizationLearnerController.updatePassword(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/sco-organization-learners/password-update; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/password-update',
      };
      const response = await scoOrganizationLearnerController.updatePassword(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
