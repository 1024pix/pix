const { expect, hFake, sinon } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');

const supOrganizationLearnerController = require('../../../../lib/application/sup-organization-learners/sup-organization-learner-controller');

describe('Unit | Application | Controller | sup-organization-learner', function () {
  describe('#reconcileSupOrganizationLearner', function () {
    const userId = 2;
    const request = {
      auth: { credentials: { userId } },
      payload: { data: { attributes: {} } },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'reconcileSupOrganizationLearner');
      usecases.reconcileSupOrganizationLearner.resolves();
    });

    it('should return information about deprecation when old route is used', async function () {
      // when
      hFake.request = {
        path: '/api/schooling-registration-user-associations/student',
      };
      const response = await supOrganizationLearnerController.reconcileSupOrganizationLearner(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.equal('true');
      expect(response.headers['Link']).to.equal('/api/sup-organization-learners/association; rel="successor-version"');
    });

    it('should not return information about deprecation when new route is used', async function () {
      // when
      hFake.request = {
        path: '/api/sup-organization-learners/association',
      };
      const response = await supOrganizationLearnerController.reconcileSupOrganizationLearner(request, hFake);

      // then
      expect(response.headers['Deprecation']).to.not.exist;
    });
  });
});
