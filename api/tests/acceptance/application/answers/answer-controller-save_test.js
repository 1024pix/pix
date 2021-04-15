const { expect, knex, databaseBuilder, mockLearningContent, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
// eslint-disable-next-line no-restricted-modules
const createServer = require('../../../../server');
const BookshelfAnswer = require('../../../../lib/infrastructure/data/answer');
const { FRENCH_FRANCE, ENGLISH_SPOKEN } = require('../../../../lib/domain/constants').LOCALE;

describe('Acceptance | Controller | answer-controller-save', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/answers', () => {
    let userId;
    let insertedAssessmentId;
    let postAnswersOptions;
    let promise;
    const correctAnswer = 'correct';
    const challengeId = 'a_challenge_id';
    const competenceId = 'recCompetence';

    beforeEach(async () => {
      const assessment = databaseBuilder.factory.buildAssessment({
        type: 'COMPETENCE_EVALUATION',
        competenceId: competenceId,
      });
      insertedAssessmentId = assessment.id;
      userId = assessment.userId;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      await knex('knowledge-elements').delete();
      await knex('answers').delete();
    });

    context('when the user is linked to the assessment', () => {

      beforeEach(async () => {
        // given
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
          competences: [{
            id: competenceId,
            areaId: 'recArea1',
            skillIds: ['recSkill1'],
            origin: 'Pix',
            nameFrFr: 'Nom de la competence FR',
            nameEnUs: 'Nom de la competence EN',
            statue: 'active',
          }],
          skills: [{
            id: 'recSkill1',
            name: '@recArea1_Competence1_Tube1_Skill1',
            status: 'actif',
            competenceId: competenceId,
            pixValue: '5',
          }],
          challenges: [{
            id: challengeId,
            competenceId: competenceId,
            skillIds: ['recSkill1'],
            status: 'validé',
            solution: correctAnswer,
            locales: ['fr-fr'],
            type: 'QROC',
          }],
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

      it('should return 201 HTTP status code', async () => {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        expect(response.statusCode).to.equal(201);
      });

      it('should return application/json', async () => {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should add a new answer into the database', async () => {
        // when
        await server.inject(postAnswersOptions);

        // then          .
        const afterAnswersNumber = await BookshelfAnswer.count();
        expect(afterAnswersNumber).to.equal(1);
      });

      it('should add a new answer with timeSpent into the database', async () => {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const answer = response.result.data;

        const model = await BookshelfAnswer.where({ id: answer.id }).fetch();

        expect(model.get('timeSpent')).not.to.be.null;
      });

      it('should return persisted answer', async () => {
        // when
        const response = await server.inject(postAnswersOptions);

        // then
        const answer = response.result.data;

        const model = await BookshelfAnswer.where({ id: answer.id }).fetch();

        expect(model.id).to.be.a('number');
        expect(model.get('value')).to.equal(postAnswersOptions.payload.data.attributes.value);
        expect(model.get('result')).to.equal('ok');
        expect(model.get('resultDetails')).to.equal('null\n');
        expect(model.get('assessmentId')).to.equal(postAnswersOptions.payload.data.relationships.assessment.data.id);
        expect(model.get('challengeId')).to.equal(postAnswersOptions.payload.data.relationships.challenge.data.id);

        expect(answer.id).to.equal(model.id.toString());
        expect(answer.id).to.equal(response.result.data.id.toString());
        expect(answer.attributes.value).to.equal(model.get('value'));
        expect(answer.attributes.result).to.equal(model.get('result'));
        expect(answer.attributes['result-details']).to.equal(model.get('resultDetails'));
        expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
        expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));
      });

      [
        { locale: FRENCH_FRANCE, expectedCompetenceName: 'Nom de la competence FR' },
        { locale: ENGLISH_SPOKEN, expectedCompetenceName: 'Nom de la competence EN' },
      ].forEach((testCase) => {
        it(`should return competence name in locale=${testCase.locale} when user levelup`, async () => {
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

    context('when user is not the user of the assessment', () => {
      beforeEach(() => {
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

      it('should return 403 HTTP status code', async () => {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(403);
      });

    });

    context('when the payload is empty', () => {
      beforeEach(() => {
        postAnswersOptions = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {},
        };
        promise = server.inject(postAnswersOptions);
      });

      it('should return 400 HTTP status code', async () => {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(400);
      });

    });

    context('when the answer is empty and timeout', () => {

      beforeEach(() => {
        // given
        const learningContent = {
          areas: [{ id: 'recArea1', competenceIds: ['recCompetence'] }],
          competences: [{
            id: 'recCompetence',
            areaId: 'recArea1',
            skillIds: ['recSkill1'],
            origin: 'Pix',
          }],
          skills: [{
            id: 'recSkill1',
            name: '@recArea1_Competence1_Tube1_Skill1',
            status: 'actif',
            competenceId: 'recCompetence',
          }],
          challenges: [{
            id: challengeId,
            competenceId: 'recCompetence',
            skillIds: ['recSkill1'],
            status: 'validé',
            solution: correctAnswer,
            locales: ['fr-fr'],
            type: 'QROC',
          }],
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

      it('should return 201 HTTP status code', async () => {
        // when
        const response = await promise;

        // then
        expect(response.statusCode).to.equal(201);
      });
    });

  });
});
