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
        targetProfileId: 1,
        validatedSkillsCount: 1,
        totalSkillsCount: 2,
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
      expect(campaignParticipationOverview.targetProfileId).to.equal(1);
      expect(campaignParticipationOverview.validatedSkillsCount).to.equal(1);
      expect(campaignParticipationOverview.totalSkillsCount).to.equal(2);
      expect(campaignParticipationOverview.organizationName).to.equal('Pix');
      expect(campaignParticipationOverview.assessmentState).to.equal('completed');
      expect(campaignParticipationOverview.campaignCode).to.equal('campaignCode');
      expect(campaignParticipationOverview.campaignTitle).to.equal('campaignTitle');
    });
  });

  describe('#masteryPercentage', () => {
    it('should compute mastery percentage', () => {
      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: true,
        validatedSkillsCount: 1,
        totalSkillsCount: 2,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(50);
    });

    it('should return 0 if total skills count is zero', () => {
      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: true,
        validatedSkillsCount: 1,
        totalSkillsCount: 0,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(0);
    });

    it('should return null if total skills count is not defined', () => {
      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: true,
        validatedSkillsCount: 1,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(null);
    });

    it('should return null the participation is not shared', () => {
      // when
      const campaignParticipationOverview = new CampaignParticipationOverview({
        isShared: false,
        validatedSkillsCount: 1,
        totalSkillsCount: 2,
      });

      // then
      expect(campaignParticipationOverview.masteryPercentage).to.equal(null);
    });
  });
});
