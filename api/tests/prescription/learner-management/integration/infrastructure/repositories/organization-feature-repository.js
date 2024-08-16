import { hasLearnersImportFeature } from '../../../../../../src/prescription/learner-management/infrastructure/repositories/organization-feature-repository.js';
import { expect, sinon } from '../../../../../test-helper.js';

describe('Integration | Repository | Organization Learners Management | Campaign Participation', function () {
  describe('#hasLearnersImportFeature', function () {
    it('should return if organization has import feature enabled', async function () {
      const organizationId = 1;
      const organizationFeatureApi = {
        getAllFeaturesFromOrganization: sinon.stub(),
      };
      organizationFeatureApi.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves({ hasLearnersImportFeature: true });

      const result = await hasLearnersImportFeature({ organizationId, organizationFeatureApi });

      expect(result).to.equal(true);
    });
  });
});
