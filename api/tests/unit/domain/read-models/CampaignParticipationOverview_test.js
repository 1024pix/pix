const CampaignParticipationOverview = require('../../../../lib/domain/read-models/CampaignParticipationOverview');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Read-Models | CampaignParticipationOverview', () => {
  describe('constructor', () => {

    it('should create CampaignParticipationOverview', () => {
      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        id: 3,
        createdAt: new Date('2020-02-15T15:00:34Z'),
        isShared: true,
        sharedAt: new Date('2020-03-15T15:00:34Z'),
        organizationName: 'Pix',
        assessmentState: 'completed',
        campaignCode: 'campaignCode',
        campaignTitle: 'campaignTitle',
      });

      // then
      expect(campaignParticipationOverview.id).to.equal(3);
      expect(campaignParticipationOverview.createdAt).to.deep.equal(new Date('2020-02-15T15:00:34Z'));
      expect(campaignParticipationOverview.sharedAt).to.deep.equal(new Date('2020-03-15T15:00:34Z'));
      expect(campaignParticipationOverview.isShared).to.be.true;
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.assessmentState).to.equal('completed');
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
    });
  });
});
