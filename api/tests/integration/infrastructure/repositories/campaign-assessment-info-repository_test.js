const { expect, databaseBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const campaignAssessmentInfoRepository = require('../../../../lib/infrastructure/repositories/campaign-assessment-info-repository');
const CampaignAssessmentInfo = require('../../../../lib/domain/read-models/CampaignAssessmentInfo');
const Assessment = require('../../../../lib/domain/models/Assessment');

describe('Integration | Infrastructure | Repositories | campaign-assessment-info-repository', () => {

  describe('#getByCampaignParticipationId', () => {

    it('should return the campaign assessment info by given campaignParticipationId', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({ isShared: false, campaignId });
      const assessmentId = databaseBuilder.factory.buildAssessment({
        campaignParticipationId: campaignParticipation.id,
        state: Assessment.states.STARTED,
        isImproving: true,
      }).id;
      await databaseBuilder.commit();

      // when
      const actualCampaignAssessmentInfo = await campaignAssessmentInfoRepository.getByCampaignParticipationId(campaignParticipation.id);

      // then
      expect(actualCampaignAssessmentInfo).to.be.instanceOf(CampaignAssessmentInfo);
      expect(actualCampaignAssessmentInfo.campaignParticipationId).to.equal(campaignParticipation.id);
      expect(actualCampaignAssessmentInfo.userId).to.equal(campaignParticipation.userId);
      expect(actualCampaignAssessmentInfo.campaignId).to.equal(campaignParticipation.campaignId);
      expect(actualCampaignAssessmentInfo.assessmentId).to.equal(assessmentId);
      expect(actualCampaignAssessmentInfo.status).to.equal(CampaignAssessmentInfo.statuses.ONGOING);
      expect(actualCampaignAssessmentInfo.isImproving).to.equal(true);
    });

    it('should throw a NotFoundError if the participation does not exist', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ type: 'PROFILES_COLLECTION' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ campaignId }).id;
      await databaseBuilder.commit();

      // when
      const error = await catchErr(campaignAssessmentInfoRepository.getByCampaignParticipationId)(campaignParticipationId);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should throw a NotFoundError if the participation is from a campaign profiles_collection', async () => {
      // when
      const error = await catchErr(campaignAssessmentInfoRepository.getByCampaignParticipationId)(123);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should return info about the most recent assessment', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ isShared: false, campaignId }).id;
      const mostRecentAssessmentId = databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        state: Assessment.states.COMPLETED,
        isImproving: true,
        createdAt: new Date('2020-01-01'),
      }).id;
      databaseBuilder.factory.buildAssessment({
        campaignParticipationId,
        state: Assessment.states.STARTED,
        isImproving: false,
        createdAt: new Date('2019-12-25'),
      });
      await databaseBuilder.commit();

      // when
      const actualCampaignAssessmentInfo = await campaignAssessmentInfoRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(actualCampaignAssessmentInfo.assessmentId).to.equal(mostRecentAssessmentId);
      expect(actualCampaignAssessmentInfo.status).to.equal(CampaignAssessmentInfo.statuses.COMPLETED);
      expect(actualCampaignAssessmentInfo.isImproving).to.equal(true);
    });

    it('should return a not started participation when no assessment found for participation', async () => {
      // given
      const campaignId = databaseBuilder.factory.buildCampaign({ type: 'ASSESSMENT' }).id;
      const campaignParticipationId = databaseBuilder.factory.buildCampaignParticipation({ isShared: false, campaignId }).id;
      await databaseBuilder.commit();

      // when
      const actualCampaignAssessmentInfo = await campaignAssessmentInfoRepository.getByCampaignParticipationId(campaignParticipationId);

      // then
      expect(actualCampaignAssessmentInfo.assessmentId).to.be.null;
      expect(actualCampaignAssessmentInfo.status).to.equal(CampaignAssessmentInfo.statuses.NOT_STARTED);
    });
  });
});
