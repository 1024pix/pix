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
});
