import {
  AlreadyExistingOrganizationFeatureError,
  FeatureNotFound,
  OrganizationNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationFeature } from '../../../../../src/organizational-entities/domain/models/OrganizationFeature.js';
import * as organizationFeatureRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-feature-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Repository | Organization-for-admin', function () {
  let organization, feature;

  beforeEach(async function () {
    organization = databaseBuilder.factory.buildOrganization();
    feature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT);
    await databaseBuilder.commit();
  });

  describe('#saveInBatch', function () {
    it('should add a several organization feature rows', async function () {
      // given
      const otherOrganization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();

      const organizationFeatures = [
        new OrganizationFeature({
          featureId: feature.id,
          organizationId: organization.id,
          params: `{ "id": 123 }`,
        }),
        new OrganizationFeature({
          featureId: feature.id,
          organizationId: otherOrganization.id,
          params: `{ "id": 456 }`,
        }),
      ];

      // when
      await organizationFeatureRepository.saveInBatch(organizationFeatures);

      //then
      const result = await knex('organization-features').where({
        featureId: feature.id,
      });

      expect(result).to.have.lengthOf(2);
      expect(result[0].featureId).to.deep.equal(organizationFeatures[0].featureId);
      expect(result[0].organizationId).to.deep.equal(organizationFeatures[0].organizationId);
      expect(result[0].params).to.deep.equal(organizationFeatures[0].params);
      expect(result[1].featureId).to.deep.equal(organizationFeatures[1].featureId);
      expect(result[1].organizationId).to.deep.equal(organizationFeatures[1].organizationId);
      expect(result[1].params).to.deep.equal(organizationFeatures[1].params);
    });

    it('throws an error if organization feature already exists', async function () {
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId: feature.id });
      await databaseBuilder.commit();

      const organizationFeatures = [
        new OrganizationFeature({
          featureId: feature.id,
          organizationId: organization.id,
          params: `{ "id": 123 }`,
        }),
      ];

      // when
      const error = await catchErr(organizationFeatureRepository.saveInBatch)(organizationFeatures);

      expect(error).to.be.instanceOf(AlreadyExistingOrganizationFeatureError);
    });

    it('throws an error if organization does not exists', async function () {
      const notExistingId = 999;
      const organizationFeatures = [
        new OrganizationFeature({
          featureId: feature.id,
          organizationId: notExistingId,
          params: `{ "id": 123 }`,
        }),
      ];

      // when
      const error = await catchErr(organizationFeatureRepository.saveInBatch)(organizationFeatures);

      expect(error).to.be.instanceOf(OrganizationNotFound);
    });

    it('throws an error if feature does not exists', async function () {
      const notExistingId = 999;
      const organizationFeatures = [
        new OrganizationFeature({
          featureId: notExistingId,
          organizationId: organization.id,
          params: `{ "id": 123 }`,
        }),
      ];

      // when
      const error = await catchErr(organizationFeatureRepository.saveInBatch)(organizationFeatures);

      expect(error).to.be.instanceOf(FeatureNotFound);
    });
  });
});
