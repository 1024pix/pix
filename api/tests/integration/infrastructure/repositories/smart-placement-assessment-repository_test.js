const {
  expect, sinon, knex, insertUserWithStandardRole, cleanupUsersAndPixRolesTables, factory, databaseBuilder,
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
    const web1SkillName = '@web1';
    const web2SkillName = '@web2';
    const secondSkillName = '@donnee4';
    const firstInferedSkillName = '@donnee3';
    const secondInferedSkillName = '@donnee2';
    const unratableSkillName = '@eval6';
    const notForAssessmentAnswerId = 3;

    const registeredAnswers = [
      {
        id: firstAnswerId,
        value: '1,4',
        result: 'ko',
        challengeId: 'challenge_1_4',
        assessmentId: assessmentId,
        createdAt: '2016-10-27 08:45:00',
      },
      {
        id: secondAnswerId,
        value: '2,8',
        result: 'ok',
        challengeId: 'challenge_2_8',
        assessmentId: assessmentId,
        createdAt: '2016-10-27 08:45:30',
      },
      {
        id: notForAssessmentAnswerId,
        value: '5,2',
        result: 'ko',
        assessmentId: 6666,
        challengeId: 'challenge_4',
        createdAt: '2016-10-27 08:45:50',
      },
    ];

    const targetProfile = new TargetProfile({
      skills: [
        new Skill({ name: web2SkillName }),
        new Skill({ name: web1SkillName }),
        new Skill({ name: secondSkillName }),
        new Skill({ name: firstInferedSkillName }),
        new Skill({ name: secondInferedSkillName }),
        new Skill({ name: unratableSkillName }),
      ],
    });

    const firstChallengeDO = factory.buildChallengeAirtableDataObject({
      id: 'challenge_1_4',
      skills: [web1SkillName],
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

    context('when the assessment is STARTED', () => {

      beforeEach(() => {
        challengeDatasource.get.onFirstCall().resolves(firstChallengeDO);
        challengeDatasource.get.onSecondCall().resolves(secondChallengeDO);
        targetProfileRepository.get.resolves(targetProfile);

        return insertUserWithStandardRole()
          .then(() => {
            return knex('assessments')
              .insert({
                id: assessmentId,
                userId: 4444,
                courseId: 'course_A',
                state: SmartPlacementAssessment.State.STARTED,
                createdAt: '2016-10-27 08:44:25',
              });
          })
          .then(() => {
            return knex('answers').insert(registeredAnswers);
          });
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
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
            pixScore: 0,
            answerId: firstAnswerId,
            skillId: web1SkillName,
          }),
          factory.buildSmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            skillId: secondSkillName,
          }),
          factory.buildSmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            skillId: firstInferedSkillName,
          }),
          factory.buildSmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
            pixScore: 0,
            answerId: secondAnswerId,
            skillId: secondInferedSkillName,
          }),
          factory.buildSmartPlacementKnowledgeElement({
            id: -1,
            source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
            status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
            pixScore: 0,
            answerId: firstAnswerId,
            skillId: web2SkillName,
          })
        ];
        const expectedSmartPlacementAssessment = new SmartPlacementAssessment({
          id: assessmentId,
          state: SmartPlacementAssessment.State.STARTED,
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
});
