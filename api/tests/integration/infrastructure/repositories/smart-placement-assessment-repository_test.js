/* eslint-disable no-useless-escape */
const {
  airtableBuilder, expect, factory, databaseBuilder,
} = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');
const smartPlacementAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-assessment-repository');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
require('../../../../lib/infrastructure/repositories/target-profile-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | SmartPlacementAssessmentRepository', () => {

  describe('#get', () => {

    let assessmentId;
    let assessment;
    let notSmartPlacementAssessmentId;
    let notSmartPlacementAssessment;
    let notExistingAssessmentId;
    let firstAnswer;
    let secondAnswer;
    let firstKnowledgeElement;
    let secondKnowledgeElement;
    let targetProfile;
    let firstSkill;
    let secondSkill;
    let thirdSkill;

    beforeEach(() => {

      assessmentId = 987654321;
      notSmartPlacementAssessmentId = 32323;
      notExistingAssessmentId = 88888;

      firstSkill = factory.buildSkill();
      secondSkill = factory.buildSkill();
      thirdSkill = factory.buildSkill();

      firstAnswer = factory.buildAnswer({ assessmentId });
      secondAnswer = factory.buildAnswer({ assessmentId });

      firstKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        pixScore: 4,
        answerId: firstAnswer.id,
        assessmentId,
        skillId: firstSkill.id,
      });
      secondKnowledgeElement = factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
        pixScore: 2,
        answerId: secondAnswer.id,
        assessmentId,
        skillId: secondSkill.id,
      });

      targetProfile = factory.buildTargetProfile({
        skills: [firstSkill, secondSkill, thirdSkill],
      });

      assessment = factory.buildSmartPlacementAssessment({
        id: assessmentId,
        answers: [firstAnswer, secondAnswer],
        knowledgeElements: [firstKnowledgeElement, secondKnowledgeElement],
        targetProfile,
      });

      // XXX: escape is necessary for nock to properly match the query
      const uri = ('OR(' +
                   `FIND(\"${firstSkill.id}\", \{Record Id\}), ` +
                   `FIND(\"${secondSkill.id}\", \{Record Id\}), ` +
                   `FIND(\"${thirdSkill.id}\", \{Record Id\})` +
                   ')');

      airtableBuilder
        .mockList({ tableName: 'Acquis' })
        .respondsToQuery({ filterByFormula: uri })
        .returns([
          airtableBuilder.factory.buildSkill({ id: firstSkill.id, nom: firstSkill.name }),
          airtableBuilder.factory.buildSkill({ id: secondSkill.id, nom: secondSkill.name }),
          airtableBuilder.factory.buildSkill({ id: thirdSkill.id, nom: thirdSkill.name }),
        ])
        .activate();

      databaseBuilder.factory.buildUser({ id: assessment.userId });

      databaseBuilder.factory.buildAssessment({
        id: assessment.id,
        userId: assessment.userId,
        type: Assessment.types.SMARTPLACEMENT,
        state: Assessment.states.COMPLETED,
      });

      databaseBuilder.factory.buildAssessment({
        id: notSmartPlacementAssessment,
        type: Assessment.types.PLACEMENT,
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

      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        id: firstKnowledgeElement.id,
        source: firstKnowledgeElement.source,
        status: firstKnowledgeElement.status,
        pixScore: firstKnowledgeElement.pixScore,
        answerId: firstKnowledgeElement.answerId,
        assessmentId: firstKnowledgeElement.assessmentId,
        skillId: firstKnowledgeElement.skillId,
      });
      databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        id: secondKnowledgeElement.id,
        source: secondKnowledgeElement.source,
        status: secondKnowledgeElement.status,
        pixScore: secondKnowledgeElement.pixScore,
        answerId: secondKnowledgeElement.answerId,
        assessmentId: secondKnowledgeElement.assessmentId,
        skillId: secondKnowledgeElement.skillId,
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

      databaseBuilder.factory.buildCampaignParticipation({
        assessmentId: assessment.id,
        campaignId: campaign.id,
      });

      databaseBuilder.factory.buildTargetProfilesSkills({
        id: 101,
        targetProfileId: targetProfile.id,
        skillId: firstSkill.id,
      });
      databaseBuilder.factory.buildTargetProfilesSkills({
        id: 102,
        targetProfileId: targetProfile.id,
        skillId: secondSkill.id,
      });
      databaseBuilder.factory.buildTargetProfilesSkills({
        id: 103,
        targetProfileId: targetProfile.id,
        skillId: thirdSkill.id,
      });

      return databaseBuilder.commit();
    });

    afterEach(() => {
      return databaseBuilder.clean();
    });

    it('should get the smart placement assessment', () => {
      // when
      const promise = smartPlacementAssessmentRepository.get(assessmentId);

      // then
      return promise.then((assessment) => {
        expect(assessment).to.be.an.instanceOf(SmartPlacementAssessment);
        expect(assessment).to.deep.equal(assessment);
      });
    });

    it('should return not found for non smart placement assessment', () => {
      // when
      const promise = smartPlacementAssessmentRepository.get(notSmartPlacementAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });

    it('should return not found when no assessment exist in database for that id', () => {
      // when
      const promise = smartPlacementAssessmentRepository.get(notExistingAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });
});
