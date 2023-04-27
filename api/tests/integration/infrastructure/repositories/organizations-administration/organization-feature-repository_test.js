const { expect, databaseBuilder } = require('../../../../test-helper');
const { knex } = require('../../../../../db/knex-database-connection');
const organizationFeatureRepository = require('../../../../../lib/infrastructure/repositories/organizations-administration/organization-feature-repository');

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
      await organizationFeatureRepository.addFeatureToOrganization(organizationId, feature.key);

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
      await organizationFeatureRepository.addFeatureToOrganization(organizationId, feature.key);
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
      await organizationFeatureRepository.removeFeatureToOrganization(organizationId, feature.key);

      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId });

      expect(result).to.be.empty;
    });

    it('Do nothing if organization has not access to the feature', async function () {
      // given & when
      await organizationFeatureRepository.removeFeatureToOrganization(organizationId, feature.key);

      // then
      const result = await knex('organization-features')
        .select('features.key')
        .join('features', 'features.id', 'organization-features.featureId')
        .where({ organizationId });

      expect(result).to.be.empty;
    });
  });
});
