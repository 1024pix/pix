const { expect } = require('../../../test-helper');
const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessmentInfo = require('../../../../lib/domain/read-models/CampaignAssessmentInfo');

describe('Unit | Domain | Models | CampaignAssessmentInfo', () => {

  describe('#isOngoing', () => {

    it('should return true when campaign assessment is on going', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.isOngoing).to.be.true;
    });

    it('should return false when campaign assessment is not going', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.COMPLETED,
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.isOngoing).to.be.false;
    });
  });

  describe('#isCompleted', () => {

    it('should return true when campaign assessment is completed', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.COMPLETED,
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.isCompleted).to.be.true;
    });

    it('should return false when campaign assessment is not completed', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.isCompleted).to.be.false;
    });
  });

  describe('#isShared', () => {

    it('should return true when campaign assessment is shared', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.COMPLETED,
        isShared: true,
      });

      // when / then
      expect(campaignAssessmentInfo.isShared).to.be.true;
    });

    it('should return false when campaign assessment is not shared', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.isShared).to.be.false;
    });
  });

  describe('#hasStarted', () => {

    it('should return true when campaign assessment has started', () => {
      let campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.COMPLETED,
      });
      expect(campaignAssessmentInfo.hasStarted).to.be.true;

      campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
      });
      expect(campaignAssessmentInfo.hasStarted).to.be.true;

      campaignAssessmentInfo = new CampaignAssessmentInfo({
        isShared: true,
      });
      expect(campaignAssessmentInfo.hasStarted).to.be.true;
    });

    it('should return false when campaign assessment has not started', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: 'anything else',
        isShared: false,
      });

      // when / then
      expect(campaignAssessmentInfo.hasStarted).to.be.false;
    });
  });

  describe('#hasOngoingImprovment', () => {

    it('should return false when campaign assessment is neither ongoing nor is improving', () => {
      let campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
        isShared: false,
        isImproving: false,
      });
      expect(campaignAssessmentInfo.hasOngoingImprovment).to.be.true;

      campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.COMPLETED,
        isShared: false,
        isImproving: true,
      });
      expect(campaignAssessmentInfo.hasOngoingImprovment).to.be.true;
    });

    it('should return true when campaign assessment is ongoing and is improving', () => {
      // given
      const campaignAssessmentInfo = new CampaignAssessmentInfo({
        assessmentState: Assessment.states.STARTED,
        isShared: false,
        isImproving: true,
      });

      // when / then
      expect(campaignAssessmentInfo.hasOngoingImprovment).to.be.true;
    });
  });
});
