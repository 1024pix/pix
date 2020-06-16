/* eslint-disable no-useless-escape */
const {
  airtableBuilder, expect, domainBuilder, databaseBuilder
} = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const CampaignAssessment = require('../../../../lib/domain/models/CampaignAssessment');
const campaignAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/campaign-assessment-repository');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');
require('../../../../lib/infrastructure/repositories/target-profile-repository');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');

const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | CampaignAssessmentRepository', () => {

  describe('#get', () => {

    let assessmentId;
    let assessment;
    let notCampaignAssessmentId;
    let notCampaignAssessment;
    let notExistingAssessmentId;
    let firstAnswer;
    let secondAnswer;
    let firstKnowledgeElement;
    let secondKnowledgeElement;
    let targetProfile;
    let firstSkill;
    let secondSkill;
    let thirdSkill;

    beforeEach(async () => {

      const userId = databaseBuilder.factory.buildUser().id;
      assessmentId = 987654321;
      notCampaignAssessmentId = 32323;
      notExistingAssessmentId = 88888;

      firstSkill = domainBuilder.buildSkill();
      secondSkill = domainBuilder.buildSkill();
      thirdSkill = domainBuilder.buildSkill();

      firstAnswer = domainBuilder.buildAnswer({ assessmentId });
      secondAnswer = domainBuilder.buildAnswer({ assessmentId });

      firstKnowledgeElement = domainBuilder.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        pixScore: 4,
        answerId: firstAnswer.id,
        assessmentId,
        skillId: firstSkill.id,
      });
      secondKnowledgeElement = domainBuilder.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.INVALIDATED,
        pixScore: 2,
        answerId: secondAnswer.id,
        assessmentId,
        skillId: secondSkill.id,
      });

      targetProfile = domainBuilder.buildTargetProfile({
        skills: [firstSkill, secondSkill, thirdSkill],
      });

      const organization = databaseBuilder.factory.buildOrganization({ id: targetProfile.organizationId });

      databaseBuilder.factory.buildTargetProfile({
        id: targetProfile.id,
        name: targetProfile.name,
        isPublic: targetProfile.isPublic,
        organizationId: targetProfile.organizationId,
      });

      const campaign = databaseBuilder.factory.buildCampaign({
        organizationId: organization.id,
        targetProfileId: targetProfile.id,
      });

      const campaignParticipation = databaseBuilder.factory.buildCampaignParticipation({
        isShared: true,
        campaignId: campaign.id,
      });

      assessment = domainBuilder.buildCampaignAssessment({
        id: assessmentId,
        answers: [firstAnswer, secondAnswer],
        knowledgeElements: [firstKnowledgeElement, secondKnowledgeElement],
        createdAt: new Date('2017-10-02T09:10:12Z'),
        userId,
        targetProfile,
        campaignParticipationId: campaignParticipation.id,
        campaignParticipation: campaignParticipation
      });

      databaseBuilder.factory.buildAssessment({
        id: assessment.id,
        userId,
        type: Assessment.types.CAMPAIGN,
        state: Assessment.states.COMPLETED,
        createdAt: assessment.createdAt,
        campaignParticipationId: campaignParticipation.id,
      });

      databaseBuilder.factory.buildAssessment({
        id: notCampaignAssessment,
        type: Assessment.types.DEMO,
      });

      databaseBuilder.factory.buildAnswer({
        id: firstAnswer.id,
        value: firstAnswer.value,
        result: 'ok',
        assessmentId: firstAnswer.assessmentId,
        challengeId: firstAnswer.challengeId,
      });
      databaseBuilder.factory.buildAnswer({
        id: secondAnswer.id,
        value: secondAnswer.value,
        result: 'ok',
        assessmentId: secondAnswer.assessmentId,
        challengeId: secondAnswer.challengeId,
      });

      databaseBuilder.factory.buildKnowledgeElement({
        id: firstKnowledgeElement.id,
        source: firstKnowledgeElement.source,
        status: firstKnowledgeElement.status,
        pixScore: firstKnowledgeElement.pixScore,
        answerId: firstKnowledgeElement.answerId,
        assessmentId: firstKnowledgeElement.assessmentId,
        skillId: firstKnowledgeElement.skillId,
        userId
      });
      databaseBuilder.factory.buildKnowledgeElement({
        id: secondKnowledgeElement.id,
        source: secondKnowledgeElement.source,
        status: secondKnowledgeElement.status,
        pixScore: secondKnowledgeElement.pixScore,
        answerId: secondKnowledgeElement.answerId,
        assessmentId: secondKnowledgeElement.assessmentId,
        skillId: secondKnowledgeElement.skillId,
        userId
      });

      databaseBuilder.factory.buildTargetProfileSkill({
        id: 101,
        targetProfileId: targetProfile.id,
        skillId: firstSkill.id,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        id: 102,
        targetProfileId: targetProfile.id,
        skillId: secondSkill.id,
      });
      databaseBuilder.factory.buildTargetProfileSkill({
        id: 103,
        targetProfileId: targetProfile.id,
        skillId: thirdSkill.id,
      });

      airtableBuilder.mockList({ tableName: 'Acquis' })
        .returns([
          airtableBuilder.factory.buildSkill(firstSkill),
          airtableBuilder.factory.buildSkill(secondSkill),
          airtableBuilder.factory.buildSkill(thirdSkill)
        ])
        .activate();

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await cache.flushAll();
      await databaseBuilder.clean();
      return airtableBuilder.cleanAll();
    });

    it('should get the campaign assessment', async () => {
      // when
      const assessmentFind = await campaignAssessmentRepository.get(assessmentId);

      // then
      expect(assessmentFind).to.be.an.instanceOf(CampaignAssessment);
      expect(assessmentFind.id).to.equal(assessment.id);
      expect(new Date(assessmentFind.createdAt)).to.deep.equal(assessment.createdAt);
      expect(assessmentFind.state).to.equal(assessment.state);
      expect(parseInt(assessmentFind.userId)).to.equal(assessment.userId);
      expect(assessmentFind.answers.length).to.equal(assessment.answers.length);
      expect(assessmentFind.knowledgeElements.length).to.equal(assessment.knowledgeElements.length);
      expect(assessmentFind.targetProfile.id).to.equal(assessment.targetProfile.id);
      expect(assessmentFind.campaignParticipation.isShared).to.be.ok;
    });

    it('should return not found for non campaign assessment', () => {
      // when
      const promise = campaignAssessmentRepository.get(notCampaignAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });

    it('should return not found when no assessment exist in database for that id', () => {
      // when
      const promise = campaignAssessmentRepository.get(notExistingAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });
});
