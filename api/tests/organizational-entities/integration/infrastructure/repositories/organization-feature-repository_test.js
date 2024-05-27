import {
  AlreadyExistingOrganizationFeatureError,
  FeatureNotFound,
  OrganizationNotFound,
} from '../../../../../src/organizational-entities/domain/errors.js';
import { OrganizationFeature } from '../../../../../src/organizational-entities/domain/models/OrganizationFeature.js';
import { OrganizationFeatureItem } from '../../../../../src/organizational-entities/domain/models/OrganizationFeatureItem.js';
import * as organizationFeatureRepository from '../../../../../src/organizational-entities/infrastructure/repositories/organization-feature-repository.js';
import { ORGANIZATION_FEATURE } from '../../../../../src/shared/domain/constants.js';
import { catchErr, databaseBuilder, expect, knex } from '../../../../test-helper.js';

describe('Integration | Repository | Organization-for-admin', function () {
  describe('#saveInBatch', function () {
    let organization, feature;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      feature = databaseBuilder.factory.buildFeature(ORGANIZATION_FEATURE.PLACES_MANAGEMENT);
      await databaseBuilder.commit();
    });

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

  describe('#findAllOrganizationFeaturesFromOrganizationId', function () {
    let organization, otherOrganization, featureOne, featureTwo, featureThree;

    beforeEach(async function () {
      organization = databaseBuilder.factory.buildOrganization();
      otherOrganization = databaseBuilder.factory.buildOrganization();

      featureOne = databaseBuilder.factory.buildFeature({
        key: 'AWESOME_FIRST_FEATURE',
      });

      featureTwo = databaseBuilder.factory.buildFeature({
        key: 'AWESOME_SECOND_FEATURE',
      });

      featureThree = databaseBuilder.factory.buildFeature({
        key: 'AWESOME_THIRD_FEATURE',
      });

      await databaseBuilder.commit();
    });

    it('should list all feature from an organization', async function () {
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId: featureOne.id });
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId: featureThree.id,
      });
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: otherOrganization.id,
        featureId: featureTwo.id,
      });

      await databaseBuilder.commit();

      const results = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
        organizationId: organization.id,
      });

      expect(results).lengthOf(2);
      expect(results[0]).instanceOf(OrganizationFeatureItem);
      expect(results.map((result) => result.name)).to.have.members([featureOne.key, featureThree.key]);
    });

    it('should return an empty list from an organization', async function () {
      const results = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
        organizationId: organization.id,
      });

      expect(results).lengthOf(0);
    });

    it('should return null params when not defined', async function () {
      databaseBuilder.factory.buildOrganizationFeature({ organizationId: organization.id, featureId: featureOne.id });

      await databaseBuilder.commit();

      const results = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
        organizationId: organization.id,
      });

      expect(results[0].params).to.be.null;
    });

    it('should return params when defined', async function () {
      const featureParams = ['this is my extraParams', 'its AWESOME'];
      databaseBuilder.factory.buildOrganizationFeature({
        organizationId: organization.id,
        featureId: featureOne.id,
        params: JSON.stringify(featureParams),
      });

      await databaseBuilder.commit();

      const results = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
        organizationId: organization.id,
      });

      expect(results[0].params).to.be.deep.equal(featureParams);
    });

    it('should return empty arry when no feature detected', async function () {
      // when
      const results = await organizationFeatureRepository.findAllOrganizationFeaturesFromOrganizationId({
        organizationId: organization.id,
      });

      // then
      expect(results).to.be.lengthOf(0);
    });
  });
});
