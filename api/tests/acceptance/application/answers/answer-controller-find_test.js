const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | answer-controller', () => {

  describe('GET /api/answers?challengeId=Y&assessmentId=Z', () => {

    let server;
    let options;
    let userId;
    let answer;
    const challengeId = 'recLt9uwa2dR3IYpi';

    context('when the assessment has an userId (is not a demo or preview)', () => {
      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challenge=${challengeId}&assessment=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return 200 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });

      it('should return application/json', () => {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          const contentType = response.headers['content-type'];
          expect(contentType).to.contain('application/json');
        });
      });

      it('should return required answer', () => {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          const answerReceived = response.result.data;
          expect(answerReceived.id).to.equal(answer.id.toString());
          expect(answerReceived.attributes.value.toString()).to.equal(answer.value.toString());
          expect(answerReceived.attributes.result.toString()).to.equal(answer.result.toString());
          expect(answerReceived.relationships.assessment.data.id.toString()).to.equal(answer.assessmentId.toString());
          expect(answerReceived.relationships.challenge.data.id.toString()).to.equal(answer.challengeId.toString());
        });
      });

    });
    context('when the assessment has an userId but the user is not the relevant user', () => {
      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challenge=${challengeId}&assessment=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
        };
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return 403 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          expect(response.statusCode).to.equal(403);
        });
      });
    });

    context('when the assessment is demo and there is no userId', () => {
      beforeEach(async () => {
        server = await createServer();
        const assessment = databaseBuilder.factory.buildAssessment({ userId: null, type: 'DEMO' });
        databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challenge=${challengeId}&assessment=${assessment.id}`,
        };
      });

      afterEach(async () => {
        await databaseBuilder.clean();
      });

      it('should return 200 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // given
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
        });
      });
    });
  });
});
