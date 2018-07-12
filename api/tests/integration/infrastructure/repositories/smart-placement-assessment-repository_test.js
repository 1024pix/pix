const {
  expect, sinon, insertUserWithStandardRole, cleanupUsersAndPixRolesTables, factory, databaseBuilder,
} = require('../../../test-helper');

const Assessment = require('../../../../lib/domain/models/Assessment');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const Skill = require('../../../../lib/domain/models/Skill');
const SmartPlacementAnswer = require('../../../../lib/domain/models/SmartPlacementAnswer');
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

    const assessmentId = 100;
    const notSmartPlacementAssessmentId = 222;
    const firstAnswerId = 1;
    const secondAnswerId = 2;
    const firstSkillName = '@web1';
    const secondSkillName = '@donnee4';
    const firstInferredSkillName = '@donnee3';
    const secondInferredSkillName = '@donnee2';
    const notForAssessmentAnswerId = 3;

    let firstKnowledgeElementId;
    let secondKnowledgeElementId;
    let thirdKnowledgeElementId;
    let fourthKnowledgeElementId;

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

      databaseBuilder.factory.buildAssessment({
        id: assessmentId,
        type: Assessment.types.SMARTPLACEMENT,
        userId: 4444,
      });
      databaseBuilder.factory.buildAssessment({
        id: notSmartPlacementAssessmentId,
        type: Assessment.types.PLACEMENT,
      });
      databaseBuilder.factory.buildAnswer({
        id: firstAnswerId,
        result: 'ko',
        assessmentId: assessmentId,
        challengeId: firstChallengeDO.id,
      });
      databaseBuilder.factory.buildAnswer({
        id: secondAnswerId,
        result: 'ok',
        assessmentId: assessmentId,
        challengeId: secondChallengeDO.id,
      });
      databaseBuilder.factory.buildAnswer({
        id: notForAssessmentAnswerId,
        result: 'ok',
        challengeId: secondChallengeDO.id,
      });

      firstKnowledgeElementId = databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
        status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
        pixScore: 0,
        answerId: firstAnswerId,
        assessmentId: assessmentId,
        skillId: firstSkillName,
      }).id;
      secondKnowledgeElementId = databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        pixScore: 0,
        answerId: secondAnswerId,
        assessmentId: assessmentId,
        skillId: secondSkillName,
      }).id;
      thirdKnowledgeElementId = databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        pixScore: 0,
        answerId: secondAnswerId,
        assessmentId: assessmentId,
        skillId: firstInferredSkillName,
      }).id;
      fourthKnowledgeElementId = databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
        source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
        status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
        pixScore: 0,
        answerId: secondAnswerId,
        assessmentId: assessmentId,
        skillId: secondInferredSkillName,
      }).id;

      return insertUserWithStandardRole()
        .then(() => databaseBuilder.commit());
    });

    afterEach(() => {
      return cleanupUsersAndPixRolesTables()
        .then(() => databaseBuilder.clean());
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
      const promise = smartPlacementAssessmentRepository.get(notSmartPlacementAssessmentId);

      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });

    it('should return a smartPlacementAssessment when one exists', () => {
      // given
      const answers = [
        factory.buildSmartPlacementAnswer({
          id: firstAnswerId,
          result: SmartPlacementAnswer.ResultType.KO,
          challengeId: 'challenge_1_4',
        }),
        factory.buildSmartPlacementAnswer({
          id: secondAnswerId,
          result: SmartPlacementAnswer.ResultType.OK,
          challengeId: 'challenge_2_8',
        }),
      ];
      const knowledgeElements = [
        factory.buildSmartPlacementKnowledgeElement({
          id: firstKnowledgeElementId,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: firstAnswerId,
          assessmentId: assessmentId,
          skillId: firstSkillName,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          id: secondKnowledgeElementId,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: secondAnswerId,
          assessmentId: assessmentId,
          skillId: secondSkillName,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          id: thirdKnowledgeElementId,
          source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: secondAnswerId,
          assessmentId: assessmentId,
          skillId: firstInferredSkillName,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          id: fourthKnowledgeElementId,
          source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: secondAnswerId,
          assessmentId: assessmentId,
          skillId: secondInferredSkillName,
        }),
      ].sort((a, b) => a.id > b.id);

      const expectedSmartPlacementAssessment = new SmartPlacementAssessment({
        id: assessmentId,
        state: SmartPlacementAssessment.State.COMPLETED,
        userId: 4444,
        answers,
        knowledgeElements,
        targetProfile,
      });

      // when
      const promise = smartPlacementAssessmentRepository.get(assessmentId);

      // then
      return promise.then((assessment) => {
        expect(assessment).to.be.an.instanceOf(SmartPlacementAssessment);
        expect(assessment).to.deep.equal(expectedSmartPlacementAssessment);
      });
    });
  });
});
