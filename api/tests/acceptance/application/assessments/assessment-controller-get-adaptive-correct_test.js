const { airtableBuilder, expect, knex } = require('../../../test-helper');
const cache = require('../../../../lib/infrastructure/caches/cache');
const server = require('../../../../server');

describe('Acceptance | API | assessment-controller-get-adaptive-correct', () => {

  const skillWeb1Id = 'recAcquisWeb1';
  const skillWeb1Name = '@web1';
  const skillWeb1 = airtableBuilder.factory.buildSkill({
    id: skillWeb1Id,
    nom: skillWeb1Name,
  });

  const skillWeb2Id = 'recAcquisWeb2';
  const skillWeb2Name = '@web2';
  const skillWeb2 = airtableBuilder.factory.buildSkill({
    id: skillWeb2Id,
    nom: skillWeb2Name,
  });

  const skillWeb3Id = 'recAcquisWeb3';
  const skillWeb3Name = '@web3';
  const skillWeb3 = airtableBuilder.factory.buildSkill({
    id: skillWeb3Id,
    nom: skillWeb3Name,
  });

  const competenceId = 'recCompetence';
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

  const adaptiveCourseId = 'recAdaptativeCourseId';
  const adaptiveCourse = airtableBuilder.factory.buildCourse({
    id: adaptiveCourseId,
    adaptatif: true,
    competence: [competenceId],
    epreuves: [],
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

  beforeEach(() => {

    airtableBuilder.mockGet({ tableName: 'Tests' })
      .returns(adaptiveCourse)
      .activate();

    airtableBuilder.mockGet({ tableName: 'Competences' })
      .returns(competence)
      .activate();

    airtableBuilder.mockList({ tableName: 'Epreuves' })
      .respondsToQuery({ view: '1.1 Mener une recherche et une veille d’information' })
      .returns([firstChallenge, secondChallenge, thirdChallenge])
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
      .respondsToQuery({ filterByFormula: 'FIND(\'1.1\', {Compétence})' })
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

  describe('(adaptive correct answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', () => {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: adaptiveCourseId,
      type: 'PLACEMENT',
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment]).returning('id')
        .then((ids) => {
          insertedAssessmentId = ids[0];

          return {
            value: 'any good answer',
            result: 'ok',
            challengeId: firstChallengeId,
            assessmentId: insertedAssessmentId,
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        });
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
    });

    it('should return the second challenge if the first answer is correct', () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${insertedAssessmentId}/next/${firstChallengeId}`,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data.id).to.equal(secondChallengeId);
      });
    });
  });

  describe('(adaptive incorrect answer) GET /api/assessments/:assessment_id/next/:current_challenge_id', () => {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: adaptiveCourseId,
      type: 'PLACEMENT',
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment]).returning('id')
        .then((ids) => {
          insertedAssessmentId = ids[0];

          return {
            value: 'any bad answer',
            result: 'ko',
            challengeId: firstChallengeId,
            assessmentId: insertedAssessmentId,
          };
        })
        .then((inserted_answer) => {
          return knex('answers').insert([inserted_answer]);
        });
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
    });

    it('should return the third challenge if the first answer is incorrect', () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${insertedAssessmentId}/next/${firstChallengeId}`,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.result.data.id).to.equal(thirdChallengeId);
      });
    });
  });

  describe('(end of adaptive test) GET /api/assessments/:assessment_id/next/:current_challenge_id', () => {

    let insertedAssessmentId = null;

    const insertedAssessment = {
      courseId: adaptiveCourseId,
      type: 'PLACEMENT',
    };

    beforeEach(() => {
      return knex('assessments').insert([insertedAssessment]).returning('id')
        .then((ids) => {
          insertedAssessmentId = ids[0];

          return [
            {
              value: 'any good answer',
              result: 'ok',
              challengeId: firstChallengeId,
              assessmentId: insertedAssessmentId,
            }, {
              value: 'any bad answer',
              result: 'ko',
              challengeId: secondChallengeId,
              assessmentId: insertedAssessmentId,
            },
          ];
        })
        .then((insertedAnswers) => {
          return knex('answers').insert(insertedAnswers);
        });
    });

    afterEach(() => {
      return knex('answers').delete()
        .then(() => knex('assessments').delete());
    });

    it('should finish the test if there is no next challenge', () => {
      // given
      const options = {
        method: 'GET',
        url: `/api/assessments/${insertedAssessmentId}/next/${secondChallengeId}`,
      };

      // when
      const promise = server.inject(options);

      // then
      return promise.then((response) => {
        expect(response.statusCode).to.equal(404);
        expect(response.result).to.deep.equal({
          error: 'Not Found',
          message: 'Not Found',
          statusCode: 404,
        });
      });
    });
  });
});
