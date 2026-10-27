import { expect } from 'chai';
import sinon from 'sinon';

import * as organizationFeaturesRepository from '../../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-features-repository.js';

describe('Unit | Repository | Organization Learner | organization-features-repository', function () {
  describe('#getAllFeaturesFromOrganization', function () {
    it('returns organization features from organization features API', async function () {
      // given
      const organizationId = 1;
      const expectedOrganizationFeatures = { hasLearnersImportFeature: true, hasOralizationFeature: false };
      const organizationFeaturesApi = {
        getAllFeaturesFromOrganization: sinon.stub(),
      };
      organizationFeaturesApi.getAllFeaturesFromOrganization
        .withArgs(organizationId)
        .resolves(expectedOrganizationFeatures);

      // when
      const organizationFeatures = await organizationFeaturesRepository.getAllFeaturesFromOrganization({
        organizationId,
        organizationFeaturesApi,
      });

      // then
      expect(organizationFeatures).to.deep.equal(expectedOrganizationFeatures);
    });
  });
});
