const {
  expect,
  knex,
  databaseBuilder,
  LearningContentMock,
  generateValidRequestAuthorizationHeader,
} = require('../../../test-helper');
const createServer = require('../../../../server');
const { FRENCH_FRANCE, ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | Controller | answer-controller-save', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('POST /api/answers', function () {
    let userId;
    let insertedAssessmentId;
    let postAnswersOptions;
    let promise;
    const competenceId = 'competencePixA1C1';
    const challengeId = 'challengePixA1C1Th1Tu1S3Ch1';
    let competenceData;

    beforeEach(async function () {
      const assessment = databaseBuilder.factory.buildAssessment({
        type: 'COMPETENCE_EVALUATION',
        competenceId,
      });
      insertedAssessmentId = assessment.id;
      userId = assessment.userId;

      await databaseBuilder.commit();
    });

    afterEach(async function () {
      await knex('knowledge-elements').delete();
      await knex('answers').delete();
    });

    context('when the user is linked to the assessment', function () {
      beforeEach(async function () {
        // given
        LearningContentMock.mockCommon();
        competenceData = LearningContentMock.getCompetenceDTO(competenceId);
        const challengeData = LearningContentMock.getChallengeDTO(challengeId);
        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: challengeData.solution,
              },
              relationships: {
                assessment: {
                  data: {
                    type: 'assessments',
                    id: insertedAssessmentId,
                  },
                },
                challenge: {
                  data: {
                    type: 'challenges',
                    id: challengeId,
                  },
                },
              },
            },
          },
        };
      });

      it('should return 201 HTTP status code', async function () {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return application/json', async function () {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should add a new answer into the database', async function () {
        // when
        await server.inject(postAnswersOptions);

        // then          .
        const { count } = await knex('answers').count().first();
        expect(count).to.equal(1);
      });

      it('should add a new answer with timeSpent into the database', async function () {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const answer = response.result.data;
        const { timeSpent } = await knex('answers').where({ id: answer.id }).first();
        expect(timeSpent).not.to.be.null;
      });

      it('should return persisted answer', async function () {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const answer = response.result.data;
        const answerDB = await knex('answers').where({ id: answer.id }).first();
        expect(answerDB.id).to.be.a('number');
        expect(answerDB.value).to.equal(postAnswersOptions.payload.data.attributes.value);
        expect(answerDB.result).to.equal('ok');
        expect(answerDB.resultDetails).to.equal('null\n');
        expect(answerDB.assessmentId).to.equal(postAnswersOptions.payload.data.relationships.assessment.data.id);
        expect(answerDB.challengeId).to.equal(postAnswersOptions.payload.data.relationships.challenge.data.id);

        expect(answer.id).to.equal(answerDB.id.toString());
        expect(answer.id).to.equal(response.result.data.id.toString());
        expect(answer.attributes.value).to.equal(answerDB.value);
        expect(answer.attributes.result).to.equal(answerDB.result);
        expect(answer.attributes['result-details']).to.equal(answerDB.resultDetails);
        expect(answer.relationships.assessment.data.id).to.equal(answerDB.assessmentId.toString());
        expect(answer.relationships.challenge.data.id).to.equal(answerDB.challengeId);
      });

      it(`should return competence name in locale=${FRENCH_FRANCE} when user levelup`, async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          earnedPix: 7,
          skillId: 'skillPixA1C1Th1Tu1S2',
          userId,
          competenceId: 'competencePixA1C1',
          assessmentId: insertedAssessmentId,
        });
        await databaseBuilder.commit();
        postAnswersOptions.headers['accept-language'] = FRENCH_FRANCE;

        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const levelup = response.result.included[0].attributes;

        expect(levelup['competence-name']).to.equal(competenceData.nameFr);
      });

      it(`should return competence name in locale=${ENGLISH_SPOKEN} when user levelup`, async function () {
        // given
        databaseBuilder.factory.buildKnowledgeElement({
          earnedPix: 7,
          skillId: 'skillPixA1C1Th1Tu1S2',
          userId,
          competenceId: 'competencePixA1C1',
          assessmentId: insertedAssessmentId,
        });
        await databaseBuilder.commit();
        postAnswersOptions.headers['accept-language'] = ENGLISH_SPOKEN;

        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const levelup = response.result.included[0].attributes;

        expect(levelup['competence-name']).to.equal(competenceData.nameEn);
      });
    });

    context('when user is not the user of the assessment', function () {
      beforeEach(function () {
        // given
        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: 'not correct answer',
              },
              relationships: {
                assessment: {
                  data: {
                    type: 'assessments',
                    id: insertedAssessmentId,
                  },
                },
                challenge: {
                  data: {
                    type: 'challenges',
                    id: 'challengePixA1C1Th1Tu1S3Ch1',
                  },
                },
              },
            },
          },
        };

        // when
        promise = server.inject(postAnswersOptions);
      });

      it('should return 403 HTTP status code', async function () {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when the payload is empty', function () {
      beforeEach(function () {
        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {},
        };
        promise = server.inject(postAnswersOptions);
      });

      it('should return 400 HTTP status code', async function () {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the answer is empty and timeout', function () {
      beforeEach(function () {
        // given
        LearningContentMock.mockCommon();
        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: '',
                timeout: 25,
              },
              relationships: {
                assessment: {
                  data: {
                    type: 'assessments',
                    id: insertedAssessmentId,
                  },
                },
                challenge: {
                  data: {
                    type: 'challenges',
                    id: challengeId,
                  },
                },
              },
            },
          },
        };

        // when
        promise = server.inject(postAnswersOptions);
      });

      it('should return 201 HTTP status code', async function () {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(201);
      });
    });
  });
});
