import { CampaignParticipation } from '../../../../lib/domain/models/CampaignParticipation.js';
import { domainBuilder, expect, sinon } from '../../../test-helper.js';

describe('Unit | Domain | Models | CampaignParticipation', function () {
  describe('#getTargetProfileId', function () {
    it('should return the targetProfileId from campaign associated', function () {
      // given
      const campaign = domainBuilder.buildCampaign.ofTypeAssessment();
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(campaign.targetProfile.id);
    });

    it('should return null if has not campaign', function () {
      // given
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign: null,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(null);
    });
  });

  describe('delete', function () {
    let clock;
    const now = new Date('2021-09-25');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: now.getTime(), toFake: ['Date'] });
    });

    afterEach(function () {
      clock.restore();
    });

    it('updates attributes deletedAt and deletedBy', function () {
      const userId = 4567;
      const campaignParticipation = new CampaignParticipation({ deletedAt: null, deletedBy: null });

      campaignParticipation.delete(userId);

      expect(campaignParticipation.deletedAt).to.deep.equal(now);
      expect(campaignParticipation.deletedBy).to.deep.equal(userId);
    });
  });
});
