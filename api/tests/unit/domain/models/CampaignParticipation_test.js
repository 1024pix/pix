const CampaignParticipation = require('../../../../lib/domain/models/CampaignParticipation');
const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | CampaignParticipation', () => {

  describe('#getTargetProfileId', () => {

    it('should return the targetProfileId from campaign associated', () => {
      // given
      const campaign = domainBuilder.buildCampaign();
      const campaignParticipation = new CampaignParticipation({
        id: 1,
        campaign,
        assessmentId: 1,
      });

      // when
      const targetProfileId = campaignParticipation.getTargetProfileId();

      // then
      expect(targetProfileId).to.equal(campaign.targetProfileId);
    });

    it('should return null if has not campaign', () => {
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

  describe('lastAssessment', () => {

    it('should retrieve the last assessment by creation date', () => {
      const campaignParticipation = new CampaignParticipation({
        assessments: [
          { createdAt: new Date('2010-10-02') },
          { createdAt: new Date('2010-10-06') },
          { createdAt: new Date('2010-10-04') },
        ]
      });
      expect(campaignParticipation.lastAssessment)
        .to.deep.equal({ createdAt: new Date('2010-10-06') });
    });

  });

});
