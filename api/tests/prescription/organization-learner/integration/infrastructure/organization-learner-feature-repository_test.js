import { OrganizationLearner } from '../../../../../src/prescription/organization-learner/domain/read-models/OrganizationLearner.js';
import * as organizationLearnerFeatureRepository from '../../../../../src/prescription/organization-learner/infrastructure/repositories/organization-learner-feature-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Prescription | OrganizationLearner | Integration | Infrastructure | OrganizationLearnerFeatureRepository', function () {
  describe('#getOrganizationLearnersByFeature', function () {
    it('returns empty array when feature is unknown', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const featureKey = 'AN_UNKNOWN_FEATURE';

      await databaseBuilder.commit();

      const result = await organizationLearnerFeatureRepository.getOrganizationLearnersByFeature({ organizationId, featureKey });

      expect(result).to.deep.equal([]);
    });

    it('returns empty array when no learner', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const featureKey = 'A_FEATURE';
      const featureId = databaseBuilder.factory.buildFeature({ key: featureKey }).id;
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId });

      await databaseBuilder.commit();

      const result = await organizationLearnerFeatureRepository.getOrganizationLearnersByFeature({ organizationId, featureKey });

      expect(result).to.deep.equal([]);
    });

    it('returns learner that have linked feature', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const featureKey = 'A_FEATURE';

      const featureId = databaseBuilder.factory.buildFeature({ key: featureKey }).id;
      const otherFeatureId = databaseBuilder.factory.buildFeature({ key: 'OTHER_FEATURE' }).id;

      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId });
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId: otherFeatureId });
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: otherOrganizationId, featureId });

      const organizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const otherFeatureOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const otherOrganizationOrganizationLearner = databaseBuilder.factory.buildOrganizationLearner({
        organizationId: otherOrganizationId,
      });

      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFeature({
        featureId,
        organizationLearnerId: organizationLearner.id,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFeature({
        featureId: otherFeatureId,
        organizationLearnerId: otherFeatureOrganizationLearner.id,
      });
      databaseBuilder.factory.prescription.organizationLearners.buildOrganizationLearnerFeature({
        featureId: featureId,
        organizationLearnerId: otherOrganizationOrganizationLearner.id,
      });

      await databaseBuilder.commit();

      const learner = new OrganizationLearner({ ...organizationLearner });

      const result = await organizationLearnerFeatureRepository.getOrganizationLearnersByFeature({ organizationId, featureKey });

      expect(result).to.deep.equal([learner]);
    });
  });
});
