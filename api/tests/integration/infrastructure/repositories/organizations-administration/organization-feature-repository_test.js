import { expect, databaseBuilder } from '../../../../test-helper.js';
import { knex } from '../../../../../db/knex-database-connection.js';
import * as organizationFeatureRepository from '../../../../../lib/shared/infrastructure/repositories/organizations-administration/organization-feature-repository.js';

describe('Integration | Repository | Organization feature', function () {
  let organizationId;
  let feature;

  beforeEach(async function () {
    organizationId = databaseBuilder.factory.buildOrganization().id;
    feature = databaseBuilder.factory.buildFeature({ key: 'AWESOME_FEATURE' });

    await databaseBuilder.commit();
  });

  afterEach(async function () {
    await knex('organization-features').delete();
  });

  describe('#addFeatureToOrganization', function () {
    it('Authorize organization to use the feature', async function () {
      // given & when
      await organizationFeatureRepository.addFeatureToOrganization({ organizationId, featureKey: feature.key });

      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId })
        .first();

      expect(result.key).to.equal(feature.key);
    });

    it('Do nothing if organization has already access to the feature', async function () {
      // given
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId: feature.id });
      await databaseBuilder.commit();

      // when
      await organizationFeatureRepository.addFeatureToOrganization({ organizationId, featureKey: feature.key });
      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId });

      expect(result.length).to.equal(1);
      expect(result[0].key).to.equal(feature.key);
    });
  });

  describe('#removeFeatureToOrganization', function () {
    it('Remove organization from the feature', async function () {
      // given
      databaseBuilder.factory.buildOrganizationFeature({ organizationId, featureId: feature.id });
      await databaseBuilder.commit();

      // when
      await organizationFeatureRepository.removeFeatureToOrganization({ organizationId, featureKey: feature.key });

      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId });

      expect(result).to.be.empty;
    });

    it('Do nothing if organization has not access to the feature', async function () {
      // given & when
      await organizationFeatureRepository.removeFeatureToOrganization({ organizationId, featureKey: feature.key });

      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId });

      expect(result).to.be.empty;
    });
  });
});
