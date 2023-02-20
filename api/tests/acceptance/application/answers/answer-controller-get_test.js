import { expect, generateValidRequestAuthorizationHeader, databaseBuilder } from '../../../test-helper';
import createServer from '../../../../server';

describe('Acceptance | Controller | answer-controller-get', function () {
  describe('GET /api/answers/:id', function () {
    let server;
    let options;
    let userId;
    let answer;

    context('when the assessment has an userId (is not a demo or preview)', function () {
      beforeEach(async function () {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answer = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          value: '1.2',
          result: 'ok',
          challengeId: 'rec1',
        });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers/${answer.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json', async function () {
        // when
        const response = await server.inject(options);

        // given
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should return required answer', async function () {
        // when
        const response = await server.inject(options);

        // given
        const answerReceived = response.result.data;
        expect(answerReceived.id).to.equal(answer.id.toString());
        expect(answerReceived.attributes.value.toString()).to.equal(answer.value.toString());
        expect(answerReceived.attributes.result.toString()).to.equal(answer.result.toString());
        expect(answerReceived.relationships.assessment.data.id.toString()).to.equal(answer.assessmentId.toString());
        expect(answerReceived.relationships.challenge.data.id.toString()).to.equal(answer.challengeId.toString());
      });
    });

    context('when the id of the answer is not an integer', function () {
      beforeEach(async function () {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: '/api/answers/salut',
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 1) },
        };
      });

      it('should return 400 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(400);
      });
    });

    context('when the assessment has an userId but the user is not the relevant user', function () {
      beforeEach(async function () {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        const answer = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          value: '1.2',
          result: 'ok',
          challengeId: 'rec1',
        });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers/${answer.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 1) },
        };
      });

      it('should return 404 HTTP status code', function () {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          expect(response.statusCode).to.equal(404);
        });
      });
    });

    context('when the assessment is demo and there is no userId', function () {
      beforeEach(async function () {
        server = await createServer();
        const assessment = databaseBuilder.factory.buildAssessment({ userId: null, type: 'DEMO' });
        const answer = databaseBuilder.factory.buildAnswer({
          assessmentId: assessment.id,
          value: '1.2',
          result: 'ok',
          challengeId: 'rec1',
        });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers/${answer.id}`,
        };
      });

      it('should return 200 HTTP status code', async function () {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
