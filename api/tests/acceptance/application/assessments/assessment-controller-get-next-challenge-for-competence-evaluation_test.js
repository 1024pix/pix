const { airtableBuilder, expect, databaseBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

const Assessment = require('../../../../lib/domain/models/Assessment');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const competenceId = 'recCompetence';

const skillWeb1Id = 'recAcquisWeb1';
const skillWeb1Name = '@web1';
const skillWeb1 = airtableBuilder.factory.buildSkill({ id: skillWeb1Id, nom: skillWeb1Name, compétenceViaTube: [ competenceId ], });

const skillWeb2Id = 'recAcquisWeb2';
const skillWeb2Name = '@web2';
const skillWeb2 = airtableBuilder.factory.buildSkill({ id: skillWeb2Id, nom: skillWeb2Name, compétenceViaTube: [ competenceId ], });

const skillWeb3Id = 'recAcquisWeb3';
const skillWeb3Name = '@web3';
const skillWeb3 = airtableBuilder.factory.buildSkill({ id: skillWeb3Id, nom: skillWeb3Name, compétenceViaTube: [ competenceId ], });

const competenceReference = '1.1 Mener une recherche et une veille d’information';
const competence = airtableBuilder.factory.buildCompetence({
  id: competenceId,
  epreuves: [],
  titre: 'Mener une recherche et une veille d’information',
  tests: [],
  acquisIdentifiants: [skillWeb1Id],
  tubes: [],
  acquisViaTubes: [skillWeb1Id],
  reference: competenceReference,
  testsRecordID: [],
  acquis: [skillWeb1Name],
});

const firstChallengeId = 'recFirstChallenge';
const firstChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: firstChallengeId,
  tests: [],
  competences: [competenceId],
  statut: 'validé',
  acquix: [skillWeb2Id],
  acquis: [skillWeb2Name],
});
const secondChallengeId = 'recSecondChallenge';
const secondChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: secondChallengeId,
  tests: [],
  competences: [competenceId],
  statut: 'validé',
  acquix: [skillWeb3Id],
  acquis: [skillWeb3Name],
});
const thirdChallengeId = 'recThirdChallenge';
const thirdChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: thirdChallengeId,
  tests: [],
  competences: [competenceId],
  statut: 'validé',
  acquix: [skillWeb1Id],
  acquis: [skillWeb1Name],
});
const otherChallengeId = 'recOtherChallenge';
const otherChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: otherChallengeId,
  tests: [],
  competences: ['other-competence'],
  statut: 'validé',
  acquix: [skillWeb1Id],
  acquis: [skillWeb1Name],
});

describe('Acceptance | API | assessment-controller-get-next-challenge-for-competence-evaluation', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();

    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();

    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns([competence])
      .activate();

    airtableBuilder.mockList({ tableName: 'Epreuves' })
      .returns([firstChallenge, secondChallenge, thirdChallenge, otherChallenge])
      .activate();

    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns([skillWeb1, skillWeb2, skillWeb3])
      .activate();
  });

  afterEach(() => {
    cache.flushAll();
    airtableBuilder.cleanAll();
  });

  describe('GET /api/assessments/:assessment_id/next', () => {

    const assessmentId = 1;
    const userId = 1234;

    context('When there is still challenges to answer', () =>  {
      beforeEach(async () => {
        databaseBuilder.factory.buildUser({ id: userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId, competenceId });
        const { id: answerId } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId,
          userId,
          competenceId
        });
        await databaseBuilder.commit();
      });

      it('should return the second challenge if the first answer is correct', () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.result.data.id).to.equal(secondChallengeId);
        });
      });
    });

    context('When there is no more challenges to answer', () =>  {
      beforeEach(async () => {
        databaseBuilder.factory.buildUser({ id: userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId, competenceId });
        const { id: answerId1 } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        const { id: answerId2 } = databaseBuilder.factory.buildAnswer({ challengeId: secondChallengeId, assessmentId, value: 'any bad answer', result: 'ko' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId1,
          userId,
          competenceId
        });
        databaseBuilder.factory.buildKnowledgeElement({
          source: KnowledgeElement.SourceType.INFERRED,
          status: KnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb1Id,
          assessmentId,
          answerId1,
          userId,
          competenceId
        });
        databaseBuilder.factory.buildKnowledgeElement({
          status: KnowledgeElement.StatusType.INVALIDATED,
          skillId: skillWeb3Id,
          assessmentId,
          answerId2,
          userId,
          competenceId
        });
        await databaseBuilder.commit();
      });

      it('should finish the test if there is no next challenge', () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) }
        };

        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep.equal({
            data: null
          });
        });
      });
    });
  });
});
