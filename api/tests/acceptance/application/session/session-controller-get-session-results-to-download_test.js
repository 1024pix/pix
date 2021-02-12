const { expect, databaseBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');
const jsonwebtoken = require('jsonwebtoken');
const settings = require('../../../../lib/config');

describe('Acceptance | Controller | session-controller-get-session-results-to-download', () => {

  describe('GET /api/sessions/download-all-results/{token}', function() {

    context('when a valid token is given', () => {

      it('should return 200 HTTP status code', async () => {
        // given
        const server = await createServer();

        const dbf = databaseBuilder.factory;

        const session = dbf.buildSession({ date: '2020/01/01', time: '12:00' });
        const sessionId = session.id;

        const candidate1 = dbf.buildCertificationCandidate({ sessionId, resultRecipientEmail: 'recipientEmail@example.net' });
        const candidate2 = dbf.buildCertificationCandidate({ sessionId, resultRecipientEmail: 'recipientEmail@example.net' });

        const certif1 = dbf.buildCertificationCourse({ sessionId: candidate1.sessionId, userId: candidate1.userId, lastName: candidate1.lastName, birthdate: candidate1.birthdate, createdAt: candidate1.createdAt });
        const certif2 = dbf.buildCertificationCourse({ sessionId: candidate2.sessionId, userId: candidate2.userId, lastName: candidate2.lastName, birthdate: candidate2.birthdate, createdAt: candidate2.createdAt });

        const assessmentId1 = dbf.buildAssessment({ certificationCourseId: certif1.id }).id;
        dbf.buildAssessment({ certificationCourseId: certif2.id });

        dbf.buildAssessmentResult({ assessmentId: assessmentId1, createdAt: new Date('2018-04-15T00:00:00Z') });

        const token = jsonwebtoken.sign({
          session_id: sessionId,
        }, settings.authentication.secret, { expiresIn: '30d' });

        const request = {
          method: 'GET',
          url: `/api/sessions/download-all-results/${token}`,
          payload: {},
        };

        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });
});
