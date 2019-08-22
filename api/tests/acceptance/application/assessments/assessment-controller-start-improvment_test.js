const { databaseBuilder, expect, generateValidRequestAuhorizationHeader } = require('../../../test-helper');
const createServer = require('../../../../server');

describe('Acceptance | API | assessment-controller-start-improvment', () => {

  let server, options, user, assessment;

  beforeEach(async () => {
    user = databaseBuilder.factory.buildUser();
    assessment = databaseBuilder.factory.buildAssessment({ userId: user.id, state: 'completed' });
    databaseBuilder.factory.buildCampaignParticipation({ userId: user.id, isShared: 'false', assessmentId: assessment.id });
    await databaseBuilder.commit();
    server = await createServer();
  });

  afterEach(async () => {
    await databaseBuilder.clean();
  });

  describe('PATH /api/assessments/{id}/start-improvment', () => {

    context('when user is connected', () => {
      beforeEach(() => {
        options = {
          method: 'PATCH',
          url: `/api/assessments/${assessment.id}/start-improvment`,
          headers: { authorization: generateValidRequestAuhorizationHeader(user.id) },
        };
      });

      it('should return 200 HTTP status code with updatedAssessment', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(200);
          expect(response.result.data.attributes.state).to.equal('improving');
        });
      });
    });

    context('when user is not connected', () => {
      beforeEach(() => {
        options = {
          method: 'PATCH',
          url: `/api/assessments/${assessment.id}/start-improvment`,
        };
      });

      it('should return 401 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });

    context('when user is connected but does not owned the assessment', () => {
      beforeEach(async () => {
        const otherUser = databaseBuilder.factory.buildUser();
        await databaseBuilder.commit();

        options = {
          method: 'PATCH',
          url: `/api/assessments/${assessment.id}/start-improvment`,
          headers: { authorization: generateValidRequestAuhorizationHeader(otherUser.id) },
        };
      });

      it('should return 401 HTTP status code', () => {
        // when
        const promise = server.inject(options);

        // then
        return promise.then((response) => {
          expect(response.statusCode).to.equal(401);
        });
      });
    });
  });
});
