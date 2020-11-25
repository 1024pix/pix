const { expect, databaseBuilder } = require('../../test-helper');
const _ = require('lodash');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

const {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  mergeTestedChallengesAndKEsByCompetences,
  // mergeCompetencesWithReferentialInfos,
} = require('../../../scripts/helpers/certif/positionned-and-tested-profile-helper');

describe.only('Integration | Scripts | create-or-update-sco-organizations.js', () => {

  describe('#findDirectAndHigherLevelKEs', () => {

    it('should return only direct and higher level knowledge elements', async () => {
      // given
      const userId = databaseBuilder.factory.buildUser({}).id;
      const directKEs = createDirectAndValidKEs({ numberOfKe: 4, userId });
      createInferredAndValidKEs({ numberOfKe: 4, userId });

      await databaseBuilder.commit();

      // when
      const result = await findDirectAndHigherLevelKEs({ userId });

      // then
      const expectedKEs = directKEs;
      expect(result).to.deep.equal(expectedKEs);
    });
  });

  describe('#getAllTestedChallenges', () => {

    it('should return a certification course challenges', async () => {
      // given
      const courseId = databaseBuilder.factory.buildCertificationCourse({}).id;
      const challenges = createChallengesForCertificationCourse({ courseId: courseId, numberOfChallenges: 5 });

      await databaseBuilder.commit();

      // when
      const result = await getAllTestedChallenges({ courseId });

      // then
      const expectedChallenges = challenges.map((challenge) => {
        return {
          id: challenge.id,
          associatedSkillName: challenge.associatedSkillName,
          associatedSkillId: challenge.associatedSkillId,
          challengeId: challenge.challengeId,
          courseId: challenge.courseId,
          competenceId: challenge.competenceId,
        }
      });
      expect(result).to.deep.equal(expectedChallenges);
    });
  });

  describe('#mergeTestedChallengesAndKEsByCompetences', () => {

    it.only('should return une boite très complexe', async () => {
      // given
      const competenceId1 = Symbol('competenceId1');
      const competenceId2 = Symbol('competenceId2');
      const skillId1 = Symbol('skillId1');
      const skillId2 = Symbol('skillId2');
      const skillId3 = Symbol('skillId3');
      const skillId4 = Symbol('skillId4');
      const KE1 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillId1,
        competenceId: competenceId1,
      });
      const KE2 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillId2,
        competenceId: competenceId1,
      });
      const KE3 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillId3,
        competenceId: competenceId1,
      });
      const KE4 = databaseBuilder.factory.buildKnowledgeElement({
        source: KnowledgeElement.SourceType.DIRECT,
        status: KnowledgeElement.StatusType.VALIDATED,
        skillId: skillId4,
        competenceId: competenceId2,
      });
      const userPositionnedKEs = [ KE1, KE2, KE3, KE4 ];
      const challengeTested1 = databaseBuilder.factory.buildCertificationChallenge({
        associatedSkillId: skillId1,
        competenceId: competenceId1,
      });
      const challengeTested2 = databaseBuilder.factory.buildCertificationChallenge({
        associatedSkillId: skillId4,
        competenceId: competenceId2,
      });
      const challengesTestedInCertif = [ challengeTested1, challengeTested2 ];

      // when
      const result = await mergeTestedChallengesAndKEsByCompetences({
        KEs: userPositionnedKEs,
        challengesTestedInCertif,
      });

      // then
      const expectedResult = {
        'competence1': {
          'tube1': [
            {
              id: skillId1,
              KEsForThisSkill: [KE1],
              mbTestedChallenge: [ challengeTested1 ],
            },
            {
              id: skillId2,
              KEsForThisSkill: [KE2],
              mbTestedChallenge: [],
            },
          ],
          'tube2': [
            {
              id: skillId3,
              KEsForThisSkill: [KE3],
              mbTestedChallenge: [],
            }
          ],
        },
        'competence2': {
          'tube3': [
            {
              id: skillId4,
              KEsForThisSkill: [KE4],
              mbTestedChallenge: [ challengeTested2 ],
            },
          ],
        },
      }
      expect(result).to.deep.equal(expectedResult);
    });
  });

});

function createDirectAndValidKEs({ numberOfKe, userId }) {
  return createKEs({
    numberOfKe,
    userId,
    source: KnowledgeElement.SourceType.DIRECT,
    status: KnowledgeElement.StatusType.VALIDATED,
  });
}

function createInferredAndValidKEs({ numberOfKe, userId }) {
  return createKEs({
    numberOfKe,
    userId,
    source: KnowledgeElement.SourceType.INFERRED,
    status: KnowledgeElement.StatusType.VALIDATED,
  });
}

function createKEs({ numberOfKe, userId, source, status }) {
  const assessmentId = databaseBuilder.factory.buildAssessment({ userId }).id;
  return _.times(numberOfKe, (i) => databaseBuilder.factory.buildKnowledgeElement({
    source,
    status,
    skillId: `${i} skillId`,
    assessmentId,
    answerId: databaseBuilder.factory.buildAnswer().id,
    userId,
    competenceId: `${i} competenceId`,
  }));
}

function createChallengesForCertificationCourse({ courseId, numberOfChallenges }) {
  return _.times(numberOfChallenges, () => databaseBuilder.factory.buildCertificationChallenge({
    courseId,
  }));
}
