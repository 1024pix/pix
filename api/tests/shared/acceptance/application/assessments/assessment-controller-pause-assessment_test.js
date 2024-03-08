import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
  mockLearningContent,
} from '../../../../test-helper.js';

describe('Acceptance | API | assessment-controller-pause-assessment', function () {
  describe('POST /api/assessments/{id}/alert', function () {
    let server;
    let user;
    let assessment;
    let options;

    beforeEach(async function () {
      const challengeId = '123';
      const skillId = 'skillId';
      const learningContent = {
        challenges: [
          {
            id: challengeId,
            skillId: skillId,
            type: 'QCM',
            embedUrl: 'embed.url',
            illustrationUrl: 'illustration.url',
            focused: true,
            attachments: ['attachment.url'],
          },
        ],
        skills: [
          {
            id: skillId,
          },
        ],
      };

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
              'challenge-id': challengeId,
            },
          },
        },
      };

      mockLearningContent(learningContent);
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
