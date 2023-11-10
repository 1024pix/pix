import {
  expect,
  knex,
  databaseBuilder,
  mockLearningContent,
  generateValidRequestAuthorizationHeader,
} from '../../../test-helper.js';

import { createServer } from '../../../../server.js';
import { LOCALE } from '../../../../src/shared/domain/constants.js';

const { FRENCH_FRANCE, ENGLISH_SPOKEN } = LOCALE;

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
    const correctAnswer = 'correct';
    const challengeId = 'a_challenge_id';
    const competenceId = 'recCompetence';

    beforeEach(async function () {
      const assessment = databaseBuilder.factory.buildAssessment({
        type: 'COMPETENCE_EVALUATION',
        competenceId: competenceId,
      });
      insertedAssessmentId = assessment.id;
      userId = assessment.userId;

      await databaseBuilder.commit();
    });

    context('when the user is linked to the assessment', function () {
      beforeEach(async function () {
        // given
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
          competences: [
            {
              id: competenceId,
              areaId: 'recArea1',
              skillIds: ['recSkill1'],
              origin: 'Pix',
              name_i18n: {
                fr: 'Nom de la competence FR',
                en: 'Nom de la competence EN',
              },
              statue: 'active',
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              name: '@recArea1_Competence1_Tube1_Skill1',
              status: 'actif',
              competenceId: competenceId,
              pixValue: '5',
            },
          ],
          challenges: [
            {
              id: challengeId,
              competenceId: competenceId,
              skillId: 'recSkill1',
              status: 'validé',
              solution: correctAnswer,
              proposals: '${a}',
              locales: ['fr-fr'],
              type: 'QROC',
            },
          ],
        };
        mockLearningContent(learningContent);

        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: correctAnswer,
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

      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        { locale: FRENCH_FRANCE, expectedCompetenceName: 'Nom de la competence FR' },
        { locale: ENGLISH_SPOKEN, expectedCompetenceName: 'Nom de la competence EN' },
      ].forEach((testCase) => {
        it(`should return competence name in locale=${testCase.locale} when user levelup`, async function () {
          // given
          databaseBuilder.factory.buildKnowledgeElement({
            earnedPix: 7,
            skillId: 'recSkill2',
            userId,
            competenceId: competenceId,
          });
          await databaseBuilder.commit();
          postAnswersOptions.headers['accept-language'] = testCase.locale;

          // when
          const response = await server.inject(postAnswersOptions);

          // then
          const levelup = response.result.included[0].attributes;

          expect(levelup['competence-name']).to.equal(testCase.expectedCompetenceName);
        });
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
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
          competences: [
            {
              id: 'recCompetence',
              areaId: 'recArea1',
              skillIds: ['recSkill1'],
              origin: 'Pix',
            },
          ],
          skills: [
            {
              id: 'recSkill1',
              name: '@recArea1_Competence1_Tube1_Skill1',
              status: 'actif',
              competenceId: 'recCompetence',
            },
          ],
          challenges: [
            {
              id: challengeId,
              competenceId: 'recCompetence',
              skillId: 'recSkill1',
              status: 'validé',
              solution: correctAnswer,
              locales: ['fr-fr'],
              proposals: '${a}',
              type: 'QROC',
            },
          ],
        };
        mockLearningContent(learningContent);

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
