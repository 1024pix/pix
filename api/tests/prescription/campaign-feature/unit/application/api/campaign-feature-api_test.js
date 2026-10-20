import { expect } from 'chai';
import * as sinon from 'sinon';

import * as campaignFeatureApi from '../../../../../../src/prescription/campaign/application/api/campaign-feature-api.js';
import { usecases } from '../../../../../../src/prescription/campaign/domain/usecases/index.js';

describe('Unit | Prescription | Application | Api | campaign-features-api', function () {
  describe('#getHighlightedTrainingsForCampaign', function () {
    it('returns a list of highlighted trainings ids, by campaignId ', async function () {
      // given
      const campaignId = 'EDUEXAMPLE';
      const highlightedTrainingIds = ['training-1', 'training-2'];
      sinon.stub(usecases, 'getHighlightedTrainingsForCampaign').resolves(highlightedTrainingIds);

      // then
      const result = await campaignFeatureApi.getHighlightedTrainingsForCampaign({ campaignId });

      // when
      expect(result).to.deep.equal(highlightedTrainingIds);
      expect(usecases.getHighlightedTrainingsForCampaign).to.have.been.calledOnceWith({ campaignId });
    });
  });
});
