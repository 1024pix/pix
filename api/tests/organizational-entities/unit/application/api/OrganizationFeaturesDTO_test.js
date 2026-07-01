import { OrganizationFeaturesDTO } from '../../../../../src/organizational-entities/application/api/OrganizationFeaturesDTO.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/constants.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Organizational Entities | application | API | OrganizationFeaturesDTO', function () {
  describe('#hasLearnersImportFeature', function () {
    it('should return true', function () {
      const organizationFeature = new OrganizationFeaturesDTO({
        features: [{ name: ORGANIZATION_FEATURE.LEARNER_IMPORT.key }],
      });

      expect(organizationFeature.hasLearnersImportFeature).to.be.true;
    });

    it('should return false', function () {
      const organizationFeature = new OrganizationFeaturesDTO({ features: [] });

      expect(organizationFeature.hasLearnersImportFeature).to.be.false;
    });
  });

  describe('#hasOralizationFeature', function () {
    it('should return true', function () {
      const organizationFeature = new OrganizationFeaturesDTO({
        features: [{ name: ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER.key }],
      });

      expect(organizationFeature.hasOralizationFeature).to.be.true;
    });

    it('should return false', function () {
      const organizationFeature = new OrganizationFeaturesDTO({ features: [] });

      expect(organizationFeature.hasOralizationFeature).to.be.false;
    });
  });
});
