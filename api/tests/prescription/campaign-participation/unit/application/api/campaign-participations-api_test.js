import { expect } from 'chai';
import sinon from 'sinon';

import * as campaignParticipationsApi from '../../../../../../src/prescription/campaign-participation/application/api/campaign-participations-api.js';
import { CampaignParticipation } from '../../../../../../src/prescription/campaign-participation/application/api/read-models/CampaignParticipation.js';
import { usecases } from '../../../../../../src/prescription/campaign-participation/domain/usecases/index.js';

describe('Unit | API | Campaign Participations', function () {
  describe('#findByUserId', function () {
    it('should return campaign participations mapped to CampaignParticipation DTOs', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'findCampaignParticipationsByUserId').resolves([
        { id: 10, campaignId: 20, targetProfileId: 30 },
        { id: 11, campaignId: 21, targetProfileId: 31 },
      ]);

      // when
      const results = await campaignParticipationsApi.findByUserId({ userId });

      // then
      expect(usecases.findCampaignParticipationsByUserId).to.have.been.calledOnceWith({ userId });
      expect(results).to.deep.equal([
        new CampaignParticipation({ id: 10, campaignId: 20, targetProfileId: 30 }),
        new CampaignParticipation({ id: 11, campaignId: 21, targetProfileId: 31 }),
      ]);
    });

    it('should return an empty array when user has no participations', async function () {
      // given
      const userId = 1;
      sinon.stub(usecases, 'findCampaignParticipationsByUserId').resolves([]);

      // when
      const results = await campaignParticipationsApi.findByUserId({ userId });

      // then
      expect(results).to.deep.equal([]);
    });
  });
});
