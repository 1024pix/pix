const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const scoOrganizationLearnerController = require('../../../../lib/application/sco-organization-learners/sco-organization-learner-controller');
const scoOrganizationLearnerSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/sco-organization-learner-serializer');
const organizationLearnerUserAssociationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');
const organizationLearnerDependentUserSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-dependent-user-serializer');
const studentInformationForAccountRecoverySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/student-information-for-account-recovery-serializer');

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
  });

  describe('#generateUsernameWithTemporaryPassword', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'generateUsernameWithTemporaryPassword');
      usecases.generateUsernameWithTemporaryPassword.resolves();
      sinon.stub(organizationLearnerDependentUserSerializer, 'serialize');
      organizationLearnerDependentUserSerializer.serialize.resolves();
      usecases.generateUsernameWithTemporaryPassword.resolves();
      sinon.stub(scoOrganizationLearnerSerializer, 'serializeCredentialsForDependent');
      scoOrganizationLearnerSerializer.serializeCredentialsForDependent.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-dependent-users/generate-username-password',
      };
      const response = await scoOrganizationLearnerController.generateUsernameWithTemporaryPassword(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/sco-organization-learners/username-password-generation; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/username-password-generation',
      };
      const response = await scoOrganizationLearnerController.generateUsernameWithTemporaryPassword(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });

  describe('#checkScoAccountRecovery', function () {
    const userId = 2;
    let request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'checkScoAccountRecovery');
      usecases.checkScoAccountRecovery.resolves();
      sinon.stub(studentInformationForAccountRecoverySerializer, 'serialize');
      studentInformationForAccountRecoverySerializer.serialize.resolves();
      sinon.stub(studentInformationForAccountRecoverySerializer, 'deserialize');
      studentInformationForAccountRecoverySerializer.deserialize.resolves();
    });

    it('should return student account information serialized', async function () {
      // given
      hFake.request = { path: {} };
      const studentInformation = {
        ineIna: '1234567890A',
        firstName: 'Bob',
        lastName: 'Camond',
        birthdate: '2001-12-08',
      };
      request = {
        payload: {
          data: {
            type: 'student-information',
            attributes: {
              'ine-ina': studentInformation.ineIna,
              'first-name': studentInformation.firstName,
              'last-name': studentInformation.lastName,
              birthdate: studentInformation.birthdate,
            },
          },
        },
      };
      const studentInformationForAccountRecovery = Symbol();
      const studentInformationForAccountRecoveryJSONAPI = Symbol();

      studentInformationForAccountRecoverySerializer.deserialize.withArgs(request.payload).resolves(studentInformation);
      usecases.checkScoAccountRecovery.withArgs({ studentInformation }).resolves(studentInformationForAccountRecovery);
      studentInformationForAccountRecoverySerializer.serialize
        .withArgs(studentInformationForAccountRecovery)
        .returns(studentInformationForAccountRecoveryJSONAPI);

      // when
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(request, hFake);

      // then
      expect(response.source).to.deep.equal(studentInformationForAccountRecoveryJSONAPI);
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-dependent-users/recover-account',
      };
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal(
        '/api/sco-organization-learners/account-recovery; rel="successor-version"'
      );
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sco-organization-learners/account-recovery',
      };
      const response = await scoOrganizationLearnerController.checkScoAccountRecovery(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
