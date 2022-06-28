const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const organizationLearnerController = require('../../../../lib/application/organization-learners/organization-learner-controller');

describe('Unit | Application | Controller | organization-learner', function () {
  describe('#dissociate', function () {
    const userId = 2;
    const organizationLearnerId = 1;
    const request = {
      auth: { credentials: { userId } },
      params: { id: organizationLearnerId },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'dissociateUserFromOrganizationLearner');
      usecases.dissociateUserFromOrganizationLearner.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations/1',
      };
      const response = await organizationLearnerController.dissociate(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/organization-learners/1/association; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/organization-learners/1/association',
      };
      const response = await organizationLearnerController.dissociate(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
