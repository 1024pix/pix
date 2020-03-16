const { airtableBuilder, databaseBuilder, expect, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/learning-content-cache');
const createServer = require('../../../../server');

const Assessment = require('../../../../lib/domain/models/Assessment');

const competenceId = 'recCompetence';

const skillWeb1 = airtableBuilder.factory.buildSkill({ compétenceViaTube: [competenceId] });
const skillWeb2 = airtableBuilder.factory.buildSkill({ compétenceViaTube: [competenceId] });
const skillWeb3 = airtableBuilder.factory.buildSkill({ compétenceViaTube: [competenceId] });

const competenceReference = '1.1 Mener une recherche et une veille d’information';
const competence = airtableBuilder.factory.buildCompetence({
  id: competenceId,
  epreuves: [],
  titre: 'Mener une recherche et une veille d’information',
  tests: [],
  acquisIdentifiants: [skillWeb1.id],
  tubes: [],
  acquisViaTubes: [skillWeb1.id],
  reference: competenceReference,
  testsRecordID: [],
  acquis: [skillWeb1.name],
});

const frenchCallengeId = 'recFrenchChallengeId';
const frenchChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: frenchCallengeId,
  tests: [],
  competences: [competenceId],
  statut: 'validé',
  acquix: [skillWeb2.id],
  acquis: [skillWeb2.name],
  langue: 'Franco Français',
});

const frenchSpokenChallengeId = 'recFrenchSpokenChallengeId';
const frenchSpokenChallenge = airtableBuilder.factory.buildChallenge.untimed({
  id: frenchSpokenChallengeId,
  tests: [],
  competences: [competenceId],
  statut: 'validé',
  acquix: [skillWeb2.id],
  acquis: [skillWeb2.name],
  langue: 'Francophone',
});

describe('Acceptance | API | assessment-controller-get-next-challenge-locale-management', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();

    airtableBuilder.mockList({ tableName: 'Domaines' })
      .returns([airtableBuilder.factory.buildArea()])
      .activate();

    airtableBuilder.mockList({ tableName: 'Competences' })
      .returns([competence])
      .activate();

    airtableBuilder.mockList({ tableName: 'Acquis' })
      .returns([skillWeb1, skillWeb2, skillWeb3])
      .activate();
  });

  afterEach(() => {
    airtableBuilder.cleanAll();
    return cache.flushAll();
  });

  describe('GET /api/assessments/:assessment_id/next', () => {

    const assessmentId = 1;
    const userId = 1234;
    context('when assessment is a competence evaluation', () => {

      context('when there is one challenge in the accepted language (fr)', () => {
        beforeEach(async () => {
          airtableBuilder.mockList({ tableName: 'Epreuves' })
            .returns([frenchSpokenChallenge, frenchChallenge])
            .activate();

          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            type: Assessment.types.COMPETENCE_EVALUATION,
            userId,
            competenceId
          });
          databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
          await databaseBuilder.commit();
        });

        it('should return the challenge in the accepted language (fr-fr)', () => {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${assessmentId}/next`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
              'accept-language': 'fr-fr'
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.result.data.id).to.equal(frenchChallenge.id);
          });
        });
      });

      context('when there is no challenge in the accepted language (fr-fr)', () => {
        beforeEach(async () => {
          airtableBuilder.mockList({ tableName: 'Epreuves' })
            .returns([frenchSpokenChallenge])
            .activate();

          databaseBuilder.factory.buildUser({ id: userId });
          databaseBuilder.factory.buildAssessment({
            id: assessmentId,
            type: Assessment.types.COMPETENCE_EVALUATION,
            userId,
            competenceId
          });
          databaseBuilder.factory.buildCompetenceEvaluation({ assessmentId, competenceId, userId });
          await databaseBuilder.commit();
        });

        it('should return the challenge in the fallback language (fr)', () => {
          // given
          const options = {
            method: 'GET',
            url: `/api/assessments/${assessmentId}/next`,
            headers: {
              authorization: generateValidRequestAuthorizationHeader(userId),
              'accept-language': 'fr-fr'
            }
          };

          // when
          const promise = server.inject(options);

          // then
          return promise.then((response) => {
            expect(response.result.data.id).to.equal(frenchSpokenChallenge.id);
          });
        });
      });
    });
  });
});
