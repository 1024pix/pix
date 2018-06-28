const {
  expect, sinon, knex, insertUserWithStandardRole, cleanupUsersAndPixRolesTables, factory,
} = require('../../../test-helper');

const SmartPlacementAssessment = require('../../../../lib/domain/models/SmartPlacementAssessment');
const SmartPlacementAnswer = require('../../../../lib/domain/models/SmartPlacementAnswer');
const smartPlacementAssessmentRepository =
  require('../../../../lib/infrastructure/repositories/smart-placement-assessment-repository');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');
const targetProfileRepository =
  require('../../../../lib/infrastructure/repositories/target-profile-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');

const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');

describe('Integration | Repository | SmartPlacementAssessmentRepository', () => {

  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    sandbox.stub(challengeDatasource, 'get');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#get', () => {

    const assessmentId = 100;
    const firstAnswerId = 1;
    const secondAnswerId = 2;
    const firstSkillName = '@web1';
    const secondSkillName = '@donnee3';
    const notForAssessmentAnswerId = 3;
    let targetProfile;

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

      return insertUserWithStandardRole()
        .then(targetProfileRepository.get)
        .then((targetProfileFromRepo) => {
          targetProfile = targetProfileFromRepo;
        })
        .then(() => {
          return knex('assessments')
            .insert({
              id: assessmentId,
              userId: 4444,
              courseId: 'course_A',
              state: 'completed',
              createdAt: '2016-10-27 08:44:25',
            });
        })
        .then(() => {
          return knex('answers').insert([
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
          ]);
        });
    });

    afterEach(() => {

      return cleanupUsersAndPixRolesTables()
        .then(() => knex('assessments').delete())
        .then(() => knex('answers').delete());
    });

    it('should throw a not found error if the assessment does not exist', () => {
      // given
      const notExistingAssessmentId = 999;

      // when
      const promise = smartPlacementAssessmentRepository.get(notExistingAssessmentId);

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
          id: -1,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          pixScore: 0,
          answerId: firstAnswerId,
          skillId: firstSkillName,
        }),
        factory.buildSmartPlacementKnowledgeElement({
          id: -1,
          source: SmartPlacementKnowledgeElement.SourceType.DIRECT,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          pixScore: 0,
          answerId: secondAnswerId,
          skillId: secondSkillName,
        }),
      ];
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
