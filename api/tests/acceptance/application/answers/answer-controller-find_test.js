const { expect, generateValidRequestAuthorizationHeader, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | Controller | answer-controller-find', () => {

  describe('GET /api/answers?challengeId=Y&assessmentId=Z', () => {

    let server;
    let options;
    let userId;
    let answer;
    const challengeId = 'recLt9uwa2dR3IYpi';

    context('when the assessmentid passed in query param is not an integer', () => {

      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challengeId=${challengeId}&assessmentId=salut`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return no answer', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.result.data).to.be.null;
      });

    });

    context('when the assessment has an userId (is not a demo or preview)', () => {

      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challengeId=${challengeId}&assessmentId=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json', async () => {
        // when
        const response = await server.inject(options);

        // given
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should return required answer', async () => {
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

    context('when the assessment has an userId but the user is not the relevant user', () => {

      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answer = databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok', challengeId });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?challengeId=${challengeId}&assessmentId=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return no answer', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.result.data).to.be.null;
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
          url: `/api/answers?challengeId=${challengeId}&assessmentId=${assessment.id}`,
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/answers?assessment=12323', () => {

    let server;
    let options;
    let userId;
    let answers;

    context('when the assessment has an userId (is not a demo or preview)', () => {

      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answers = [
          databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id }),
          databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id })
        ];
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?assessmentId=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId) },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return application/json', async () => {
        // when
        const response = await server.inject(options);

        // given
        const contentType = response.headers['content-type'];
        expect(contentType).to.contain('application/json');
      });

      it('should return required answers', async () => {
        // when
        const response = await server.inject(options);

        // given
        const answerReceived = response.result.data;
        expect(answerReceived.length).to.equal(2);
        expect(answerReceived[0].type).to.equal('answers');
        expect(answerReceived[1].type).to.equal('answers');
        expect([answerReceived[0].id, answerReceived[1].id]).to.have.members([answers[0].id.toString(), answers[1].id.toString()]);
      });

    });

    context('when the assessment has an userId but the user is not the relevant user', () => {

      beforeEach(async () => {
        server = await createServer();
        userId = databaseBuilder.factory.buildUser().id;
        const assessment = databaseBuilder.factory.buildAssessment({ userId, type: 'COMPETENCE_EVALUATION' });
        answers = [databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok' })];
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?assessmentId=${assessment.id}`,
          headers: { authorization: generateValidRequestAuthorizationHeader(userId + 3) },
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });

      it('should return no answer', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.result.data).to.deep.equal([]);
      });
    });

    context('when the assessment is demo and there is no userId', () => {

      beforeEach(async () => {
        server = await createServer();
        const assessment = databaseBuilder.factory.buildAssessment({ userId: null, type: 'DEMO' });
        databaseBuilder.factory.buildAnswer({ assessmentId: assessment.id, value: '1.2', result: 'ok' });
        await databaseBuilder.commit();
        options = {
          method: 'GET',
          url: `/api/answers?&assessmentId=${assessment.id}`,
        };
      });

      it('should return 200 HTTP status code', async () => {
        // when
        const response = await server.inject(options);

        // given
        expect(response.statusCode).to.equal(200);
      });
    });
  });

});
