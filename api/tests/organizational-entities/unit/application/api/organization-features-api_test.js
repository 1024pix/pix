import sinon from 'sinon';

import * as organizationEntitiesApi from '../../../../../src/organizational-entities/application/api/organization-features-api.js';
import { OrganizationFeaturesDTO } from '../../../../../src/organizational-entities/application/api/OrganizationFeaturesDTO.js';
import { OrganizationFeatureItem } from '../../../../../src/organizational-entities/domain/models/OrganizationFeatureItem.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | Application | API | organization-features-api', function () {
  describe('#getAllFeaturesFromOrganization', function () {
    it('should return OrganizationFeature configuration from organization', async function () {
      // given
      const organizationId = Symbol('organizationId');
      const organizationFeatureRepository = {
        findAllOrganizationFeaturesFromOrganizationId: sinon.stub(),
      };

      organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId
        .withArgs({ organizationId })
        .resolves([{}]);

      // when
      const result = await organizationEntitiesApi.getAllFeaturesFromOrganization(organizationId, {
        organizationFeatureRepository,
      });

      // then
      expect(result).to.be.instanceOf(OrganizationFeaturesDTO);
      expect(result.features[0]).not.to.be.instanceOf(OrganizationFeatureItem);
    });
  });
});
