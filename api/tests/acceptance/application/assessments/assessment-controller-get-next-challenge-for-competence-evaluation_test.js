const { airtableBuilder, expect, databaseBuilder, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const createServer = require('../../../../server');

const Assessment = require('../../../../lib/domain/models/Assessment');
const SmartPlacementKnowledgeElement = require('../../../../lib/domain/models/SmartPlacementKnowledgeElement');

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
  });

  beforeEach(() => {
    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();

    airtableBuilder.mockGet({ tableName: 'Competences' })
      .returns(competence)
      .activate();

    airtableBuilder.mockList({ tableName: 'Epreuves' })
      .returns([firstChallenge, secondChallenge, thirdChallenge, otherChallenge])
      .activate();

    airtableBuilder.mockGet({ tableName: 'Epreuves' })
      .returns(firstChallenge)
      .activate();

    airtableBuilder.mockGet({ tableName: 'Epreuves' })
      .returns(secondChallenge)
      .activate();

    airtableBuilder.mockGet({ tableName: 'Epreuves' })
      .returns(thirdChallenge)
      .activate();

    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns([skillWeb1, skillWeb2, skillWeb3])
      .activate();

    airtableBuilder.mockGet({ tableName: 'Acquis' })
      .returns(skillWeb1)
      .activate();

    airtableBuilder.mockGet({ tableName: 'Acquis' })
      .returns(skillWeb2)
      .activate();

    airtableBuilder.mockGet({ tableName: 'Acquis' })
      .returns(skillWeb3)
      .activate();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
  });

  after(() => {
    cache.flushAll();
  });

  describe('GET /api/assessments/:assessment_id/next', () => {

    const assessmentId = 1;
    const userId = 1234;

    context('When there is still challenges to answer', () =>  {
      beforeEach(async () => {
        databaseBuilder.factory.buildUser({ userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId });
        const { id: answerId } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId,
          userId,
          competenceId
        });
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return the second challenge if the first answer is correct', () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
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
        databaseBuilder.factory.buildUser({ userId });
        databaseBuilder.factory.buildAssessment({ id: assessmentId, type: Assessment.types.COMPETENCE_EVALUATION, userId });
        const { id: answerId1 } = databaseBuilder.factory.buildAnswer({ challengeId: firstChallengeId, assessmentId, value: 'any good answer', result: 'ok' });
        const { id: answerId2 } = databaseBuilder.factory.buildAnswer({ challengeId: secondChallengeId, assessmentId, value: 'any bad answer', result: 'ko' });
        databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb2Id,
          assessmentId,
          answerId1,
          userId,
          competenceId
        });
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          source: SmartPlacementKnowledgeElement.SourceType.INFERRED,
          status: SmartPlacementKnowledgeElement.StatusType.VALIDATED,
          skillId: skillWeb1Id,
          assessmentId,
          answerId1,
          userId,
          competenceId
        });
        databaseBuilder.factory.buildSmartPlacementKnowledgeElement({
          status: SmartPlacementKnowledgeElement.StatusType.INVALIDATED,
          skillId: skillWeb3Id,
          assessmentId,
          answerId2,
          userId,
          competenceId
        });
        await databaseBuilder.commit();
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should finish the test if there is no next challenge', () => {
        // given
        const options = {
          method: 'GET',
          url: `/api/assessments/${assessmentId}/next`,
          headers: { authorization: generateValidRequestAuhorizationHeader(userId) }
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
