import { expect, databaseBuilder } from '../../../../test-helper.js';
import { ORGANIZATION_FEATURE } from '../../../../../lib/domain/constants.js';
import * as organizationFeatureRepository from '../../../../../src/shared/infrastructure/repositories/organization-feature-repository.js';

describe('Integration | Infrastructure | Repository | organization-feature', function () {
  describe('#getByOrganizationIdAndFeatureKey', function () {
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization().id;
    });

    it('should return activated feature for given organization id and feature key', async function () {
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId,
        featureId: feature.id,
      });
      await databaseBuilder.commit();

      const organizationFeature = await organizationFeatureRepository.isFeatureEnabledForOrganization({
        organizationId,
        featureKey: feature.key,
      });

      expect(organizationFeature).to.be.true;
    });

    it('should not return non activated feature for given organization id and feature key', async function () {
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });

      await databaseBuilder.commit();

      const organizationFeature = await organizationFeatureRepository.isFeatureEnabledForOrganization({
        organizationId,
        featureKey: feature.key,
      });

      expect(organizationFeature).to.be.false;
    });

    it('should not return feature for another organization id', async function () {
      const feature = databaseBuilder.factory.buildFeature({
        key: ORGANIZATION_FEATURE.PLACES_MANAGEMENT.key,
      });
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: anotherOrganizationId,
        featureId: feature.id,
      });
      await databaseBuilder.commit();

      const organizationFeature = await organizationFeatureRepository.isFeatureEnabledForOrganization({
        organizationId,
        featureKey: feature.key,
      });

      expect(organizationFeature).to.be.false;
    });
  });
});
