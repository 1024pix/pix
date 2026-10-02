import { expect } from 'chai';
import sinon from 'sinon';

import * as campaignFeatureRepository from '../../../../../src/devcomp/infrastructure/repositories/campaign-feature-repository.js';

describe('Unit | Devcomp | Infrastructure | Repositories | CampaignFeatureRepository ', function () {
  describe('#getHighlightedTrainingsForCampaign', function () {
    it('calls campaignFeatureApi to fetch data', function () {
      // given
      const campaignFeatureApi = { getHighlightedTrainingsForCampaign: sinon.stub() };
      const campaignId = 'EDUEXAMPLE';

      // when
      campaignFeatureRepository.getHighlightedTrainingsForCampaign({
        campaignId,
        campaignFeatureApi,
      });

      // then
      expect(campaignFeatureApi.getHighlightedTrainingsForCampaign).to.have.been.calledOnceWithExactly({
        campaignId,
      });
    });
  });
});
