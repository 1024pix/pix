const { expect, databaseBuilder } = require('../../test-helper');
const _ = require('lodash');

const KnowledgeElement = require('../../../lib/domain/models/KnowledgeElement');

const {
  findDirectAndHigherLevelKEs,
  getAllTestedChallenges,
  // mergeTestedChallengesAndKEsByCompetences,
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
      console.log({ courseId });
      const expectedChallenges = createChallengesForCertificationCourse({ courseId, numberOfChallenges: 5 });
      console.log({ expectedChallenges });

      await databaseBuilder.commit();

      // when
      const result = await getAllTestedChallenges({ courseId });
      console.log({ result });

      // then
      expect(result).to.deep.equal(expectedChallenges);
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
