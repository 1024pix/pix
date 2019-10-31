const { expect, knex, nock, databaseBuilder, airtableBuilder, generateValidRequestAuthorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');
const BookshelfAnswer = require('../../../../lib/infrastructure/data/answer');

describe('Acceptance | Controller | answer-controller-save', () => {

  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  describe('POST /api/answers', () => {
    let userId;
    let insertedAssessmentId;
    let options;
    let promise;
    const challengeId = 'a_challenge_id';

    beforeEach(async () => {
      const assessment = databaseBuilder.factory.buildAssessment();
      insertedAssessmentId = assessment.id;
      userId = assessment.userId;

      await databaseBuilder.commit();
    });

    afterEach(async () => {
      nock.cleanAll();
      airtableBuilder.cleanAll();

      await knex('answers').delete();
      await databaseBuilder.clean();
    });

    context('when the user is linked to the assessment', () => {

      beforeEach(() => {
        // given
        const area = airtableBuilder.factory.buildArea();

        const competence = airtableBuilder.factory.buildCompetence({
          id: 'recCompetence',
          domaine: [area.id],
          domaineCode: area['Code']
        });
        const skill = airtableBuilder.factory.buildSkill({
          compétenceViaTube: [competence.id],
        });
        const challenge = airtableBuilder.factory.buildChallenge({
          id: challengeId,
          competences: [competence.id],
          acquix: [skill.id],
          status: 'validé',
        });
        airtableBuilder
          .mockList({ tableName: 'Domaines' })
          .returns([area])
          .activate();

        airtableBuilder
          .mockGet({ tableName: 'Competences' })
          .returns(competence)
          .activate();

        airtableBuilder
          .mockGet({ tableName: 'Acquis' })
          .returns(skill)
          .activate();

        airtableBuilder
          .mockGet({ tableName: 'Epreuves' })
          .returns(challenge)
          .activate();

        options = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: '1',
                'elapsed-time': 100,
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
        promise = server.inject(options);
      });

      it('should return 201 HTTP status code', () => {
        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(201);
        });
      });
      it('should return application/json', () => {
        // then
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });
      it('should add a new answer into the database', () => {
        // then
        return promise
          .then(() => BookshelfAnswer.count())
          .then((afterAnswersNumber) => {
            expect(afterAnswersNumber).to.equal(1);
          });
      });
      it('should return persisted answer', () => {
        // then
        return promise.then((response) => {
          const answer = response.result.data;

          new BookshelfAnswer().fetch()
            .then((model) => {
              expect(model.id).to.be.a('number');
              expect(model.get('value')).to.equal(options.payload.data.attributes.value);
              expect(model.get('result')).to.equal('ok');
              expect(model.get('resultDetails')).to.equal('null\n');
              expect(model.get('assessmentId')).to.equal(options.payload.data.relationships.assessment.data.id);
              expect(model.get('challengeId')).to.equal(options.payload.data.relationships.challenge.data.id);

              expect(answer.id).to.equal(model.id.toString());
              expect(answer.id).to.equal(response.result.data.id.toString());
              expect(answer.attributes.value).to.equal(model.get('value'));
              expect(answer.attributes.result).to.equal(model.get('result'));
              expect(answer.attributes['result-details']).to.equal(model.get('resultDetails'));
              expect(answer.relationships.assessment.data.id).to.equal(model.get('assessmentId').toString());
              expect(answer.relationships.challenge.data.id).to.equal(model.get('challengeId'));
            });
        });
      });
      it('should return persisted answer with elapsedTime', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then(() => {
          new BookshelfAnswer()
            .fetch()
            .then((model) => {
              expect(model.get('elapsedTime')).to.equal(options.payload.data.attributes['elapsed-time']);
            });
        });
      });
    });

    context('when user is not the user of the assessment', () => {
      beforeEach(() => {
        // given
        options = {
          method: 'POST',
          url: '/api/answers',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
          payload: {
            data: {
              type: 'answers',
              attributes: {
                value: '1',
                'elapsed-time': 100,
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
        promise = server.inject(options);
      });

      it('should return 403 HTTP status code', () => {
        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });

    });

  });

});
