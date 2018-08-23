const {
  expect, sinon, insertUserWithStandardRole, cleanupUsersAndPixRolesTables, factory, databaseBuilder,
} = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const Skill = require('../../../../lib/domain/models/Skill');
const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');
const smartPlacementAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-assessment-repository');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const targetProfileRepository =
  require('../../../../lib/infrastructure/repositories/target-profile-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Repository | SmartPlacementAssessmentRepository', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(challengeDatasource, 'get');
    sandbox.stub(targetProfileRepository, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    describe('finding smart placement by id', () => {

      let givenPlacementAssessment;
      let givenSmartPlacementAssessment;

      const targetProfile = new TargetProfile({});

      beforeEach(() => {

        targetProfileRepository.get.resolves(targetProfile);

        givenPlacementAssessment = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.PLACEMENT,
        });
        givenSmartPlacementAssessment = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.SMARTPLACEMENT,
        });

        return databaseBuilder.commit();
      });

      afterEach(() => {
        return cleanupUsersAndPixRolesTables()
          .then(() => databaseBuilder.clean());
      });

      it('should find an existing smart placement assessment', () => {
        // when
        const promise = smartPlacementAssessmentRepository.get(givenSmartPlacementAssessment.id);

        // then
        return promise.then((assessment) => {
          expect(assessment.id).to.equal(givenSmartPlacementAssessment.id);
        });
      });

      it('should throw a not found error if the assessment does not exist', () => {
        // given
        const notExistingAssessmentId = 999;

        // when
        const promise = smartPlacementAssessmentRepository.get(notExistingAssessmentId);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });

      it('should throw a not found error if the assessment is not of type smartPlacement', () => {
        // when
        const promise = smartPlacementAssessmentRepository.get(givenPlacementAssessment.id);

        // then
        return expect(promise).to.be.rejectedWith(NotFoundError);
      });
    });

    describe('Full Smart Placement behaviour', () => {

      const firstAnswerId = 1;
      const secondAnswerId = 2;
      const firstSkillName = '@web1';
      const secondSkillName = '@donnee4';
      const firstInferredSkillName = '@donnee3';
      const secondInferredSkillName = '@donnee2';
      const notForAssessmentAnswerId = 3;

      let givenSmartPlacementAssessment;
      let givenAnswers;
      let givenKnowledgeElements;

      const targetProfile = new TargetProfile({
        skills: [
          new Skill({ name: firstSkillName }),
          new Skill({ name: secondSkillName }),
          new Skill({ name: firstInferredSkillName }),
          new Skill({ name: secondInferredSkillName }),
        ],
      });

      const firstChallengeDO = factory.buildChallengeAirtableDataObject({
        id: 'challenge_1_4',
        skills: [firstSkillName],
      });

      const secondChallengeDO = factory.buildChallengeAirtableDataObject({
        id: 'challenge_2_8',
        skills: [secondSkillName],
      });

      beforeEach(() => {
        challengeDatasource.get.onFirstCall().resolves(firstChallengeDO);
        challengeDatasource.get.onSecondCall().resolves(secondChallengeDO);
        targetProfileRepository.get.resolves(targetProfile);

        givenSmartPlacementAssessment = databaseBuilder.factory.buildAssessment({
          type: Assessment.types.SMARTPLACEMENT,
        });

        givenAnswers = [
          databaseBuilder.factory.buildAnswer({
            id: firstAnswerId,
            result: 'ko',
            assessmentId: givenSmartPlacementAssessment.id,
            challengeId: firstChallengeDO.id,
          }),
          databaseBuilder.factory.buildAnswer({
            id: secondAnswerId,
            result: 'ok',
            assessmentId: givenSmartPlacementAssessment.id,
            challengeId: secondChallengeDO.id,
          }),
          databaseBuilder.factory.buildAnswer({
            id: notForAssessmentAnswerId,
            result: 'ok',
            challengeId: secondChallengeDO.id,
          })
        ];

        givenKnowledgeElements = [
          databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
            pixScore: 0,
            answerId: firstAnswerId,
            assessmentId: givenSmartPlacementAssessment.id,
            skillId: firstSkillName,
          }),
          databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            assessmentId: givenSmartPlacementAssessment.id,
            skillId: secondSkillName,
          }),
          databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            assessmentId: givenSmartPlacementAssessment.id,
            skillId: firstInferredSkillName,
          }),
          databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            assessmentId: givenSmartPlacementAssessment.id,
            skillId: secondInferredSkillName,
          }),
        ];

        return insertUserWithStandardRole()
          .then(() => databaseBuilder.commit());
      });

      afterEach(() => {
        return cleanupUsersAndPixRolesTables()
          .then(() => databaseBuilder.clean());
      });

      it('should not include answers given to a regular placement assessment', () => {
        // given
        const expectedAnswersForSmartPlacementAssessment = givenAnswers
          .filter((answer) => answer.assessmentId === givenSmartPlacementAssessment.id)
          .map(factory.buildSmartPlacementAnswer);
        const expectedKnowledgeElements = givenKnowledgeElements
          .map(factory.buildSmartPlacementKnowledgeElement)
          .sort((a, b) => a.id > b.id);

        const expectedSmartPlacementAssessment = factory.buildSmartPlacementAssessment({
          id: givenSmartPlacementAssessment.id,
          createdAt: givenSmartPlacementAssessment.createdAt,
          state: givenSmartPlacementAssessment.state,
          userId: givenSmartPlacementAssessment.userId,
          answers: expectedAnswersForSmartPlacementAssessment,
          knowledgeElements: expectedKnowledgeElements,
          targetProfile,
        });

        // when
        const promise = smartPlacementAssessmentRepository.get(givenSmartPlacementAssessment.id);

        // then
        return promise.then((assessment) => {
          assessment.createdAt = new Date(assessment.createdAt);
          expect(assessment).to.be.an.instanceOf(SmartPlacementAssessment);
          expect(assessment).to.deep.equal(expectedSmartPlacementAssessment);
        });
      });
    });
  });
});
