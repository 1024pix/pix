import * as organizationEntitiesApi from '../../../../../src/organizational-entities/application/api/organization-features-api.js';
import { OrganizationFeaturesDTO } from '../../../../../src/organizational-entities/application/api/OrganizationFeaturesDTO.js';
import { OrganizationFeatureItem } from '../../../../../src/organizational-entities/domain/models/OrganizationFeatureItem.js';
import { usecases } from '../../../../../src/organizational-entities/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | API | organization-features-api', function () {
  describe('#getAllFeaturesFromOrganization', function () {
    it('should return OrganizationFeature configuration from organization', async function () {
      // given
      const organizationId = Symbol('organizationId');

      const getOrganizationFeatures = sinon.stub(usecases, 'findOrganizationFeatures');
      getOrganizationFeatures
        .withArgs({
          organizationId,
        })
        .resolves([{}]);

      // when
      const result = await organizationEntitiesApi.getAllFeaturesFromOrganization(organizationId);

      // then
      expect(result).to.be.instanceOf(OrganizationFeaturesDTO);
      expect(result.features[0]).not.to.be.instanceOf(OrganizationFeatureItem);
    });
  });
});
