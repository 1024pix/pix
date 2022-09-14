const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const organizationLearnerController = require('../../../../lib/application/organization-learners/organization-learner-controller');
const organizationLearnerIdentitySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-identity-serializer');
const organizationLearnerUserAssociationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-learner-user-association-serializer');

describe('Unit | Application | Controller | organization-learner', function () {
  describe('#findAssociation', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      query: {},
    };

    beforeEach(function () {
      sinon.stub(usecases, 'findAssociationBetweenUserAndOrganizationLearner');
      usecases.findAssociationBetweenUserAndOrganizationLearner.resolves();
      sinon.stub(organizationLearnerIdentitySerializer, 'serialize');
      organizationLearnerIdentitySerializer.serialize.resolves();
      sinon.stub(organizationLearnerUserAssociationSerializer, 'serialize');
      organizationLearnerUserAssociationSerializer.serialize.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations',
      };
      const response = await organizationLearnerController.findAssociation(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/organization-learners; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/organization-learners',
      };
      const response = await organizationLearnerController.findAssociation(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
