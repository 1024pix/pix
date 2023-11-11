import { expect, databaseBuilder, generateValidRequestAuthorizationHeader, knex } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Assessment } from '../../../../src/shared/domain/models/Assessment.js';

describe('Acceptance | API | assessment-controller-pause-assessment', function () {
  describe('POST /api/assessments/{id}/alert', function () {
    let server;
    let user;
    let assessment;
    let options;

    beforeEach(async function () {
      server = await createServer();

      user = databaseBuilder.factory.buildUser();
      assessment = databaseBuilder.factory.buildAssessment({
        state: Assessment.states.STARTED,
        userId: user.id,
      });
      options = {
        method: 'POST',
        url: `/api/assessments/${assessment.id}/alert`,
        headers: { authorization: generateValidRequestAuthorizationHeader(user.id) },
        payload: {
          data: {
            attributes: {
              'challenge-id': '123',
            },
          },
        },
      };

      return databaseBuilder.commit();
    });

    it('should respond with a 401 if requested user is not the same as the user of the assessment', async function () {
      // given
      const otherUserId = 9999;
      options.headers.authorization = generateValidRequestAuthorizationHeader(otherUserId);
      options.payload = {};

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(401);
    });

    it('should save a challenge alert', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const certificationChallengeAlert = await knex('certification-challenge-live-alerts').first();
      expect(certificationChallengeAlert.challengeId).to.equal('123');
      expect(certificationChallengeAlert.assessmentId).to.equal(assessment.id);
    });
  });
});
