import { expect } from 'chai';

import * as campaignFeatureRepository from '../../../../../src/devcomp/infrastructure/repositories/campaign-feature-repository.js';
import { CAMPAIGN_FEATURES } from '../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | DevComp | Repositories | CampaignFeatureRepository', function () {
  describe('when the campaign has no RECOMMENDATION_ENGINE featur', function () {
    it('should return an empty array', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      await databaseBuilder.commit();

      // when
      const highlightedTrainingIds = await campaignFeatureRepository.getHighlightedTrainingsForCampaign({
        campaignId,
      });

      // then
      expect(highlightedTrainingIds).to.deep.equal([]);
    });

    it('should return an empty array when the RECOMMENDATION_ENGINE feature has no highlightedTrainingIds param', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const feature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE);
      databaseBuilder.factory.buildCampaignFeature({ campaignId, featureId: feature.id });
      await databaseBuilder.commit();

      // when
      const highlightedTrainingIds = await campaignFeatureRepository.getHighlightedTrainingsForCampaign({
        campaignId,
      });

      // then
      expect(highlightedTrainingIds).to.deep.equal([]);
    });

    it('should return the highlightedTrainingIds stored in the RECOMMENDATION_ENGINE feature params', async function () {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign().id;
      const feature = databaseBuilder.factory.buildFeature(CAMPAIGN_FEATURES.RECOMMENDATION_ENGINE);
      databaseBuilder.factory.buildCampaignFeature({
        campaignId,
        featureId: feature.id,
        params: { highlightedTrainingIds: [123, 456] },
      });
      await databaseBuilder.commit();

      // when
      const highlightedTrainingIds = await campaignFeatureRepository.getHighlightedTrainingsForCampaign({
        campaignId,
      });

      // then
      expect(highlightedTrainingIds).to.deep.equal([123, 456]);
    });
  });
});
