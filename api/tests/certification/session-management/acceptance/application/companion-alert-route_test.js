import { CertificationCompanionLiveAlertStatus } from '../../../../../src/certification/shared/domain/models/CertificationCompanionLiveAlert.js';
import { Assessment } from '../../../../../src/shared/domain/models/Assessment.js';
import {
  createServer,
  databaseBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  knex,
} from '../../../../test-helper.js';

describe('Certification | Session Management | Acceptance | Application | Routes | companion-alert', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  describe('PATCH /api/sessions/{sessionId}/users/{userId}/clear-companion-alert', function () {
    it('should return 204 no content and set alert status to CLEARED', async function () {
      // given
      const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
      const { id: sessionId } = databaseBuilder.factory.buildSession({ certificationCenterId });
      const { id: certificationCandidateId, userId } = databaseBuilder.factory.buildCertificationCandidate({
        sessionId,
      });
      databaseBuilder.factory.buildCoreSubscription({ certificationCandidateId });
      const { id: certificationCourseId } = databaseBuilder.factory.buildCertificationCourse({
        sessionId,
        userId,
      });
      const { id: assessmentId } = databaseBuilder.factory.buildAssessment({
        type: Assessment.types.CERTIFICATION,
        state: Assessment.states.STARTED,
        userId,
        certificationCourseId,
      });

      databaseBuilder.factory.buildCertificationCompanionLiveAlert({
        assessmentId,
        status: CertificationCompanionLiveAlertStatus.ONGOING,
      });

      const { userId: supervisorId } = databaseBuilder.factory.buildSupervisorAccess({ sessionId });

      await databaseBuilder.commit();

      const headers = { authorization: generateValidRequestAuthorizationHeader(supervisorId, 'pix-certif') };

      const options = {
        headers,
        method: 'PATCH',
        url: `/api/sessions/${sessionId}/users/${userId}/clear-companion-alert`,
      };

      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(204);
      const alerts = await knex.select('assessmentId', 'status').from('certification-companion-live-alerts');
      expect(alerts).to.deep.equal([{ assessmentId, status: CertificationCompanionLiveAlertStatus.CLEARED }]);
    });

    describe('when user does NOT have supervisor access on session', function () {
      it('should return 401 unauthorized', async function () {
        // given
        const { id: certificationCenterId } = databaseBuilder.factory.buildCertificationCenter();
        const { id: sessionId } = databaseBuilder.factory.buildSession({ certificationCenterId });
        const { id: otherSessionId } = databaseBuilder.factory.buildSession({ certificationCenterId });

        const { userId: supervisorId } = databaseBuilder.factory.buildSupervisorAccess({ sessionId: otherSessionId });

        await databaseBuilder.commit();

        const headers = { authorization: generateValidRequestAuthorizationHeader(supervisorId, 'pix-certif') };

        const options = {
          headers,
          method: 'PATCH',
          url: `/api/sessions/${sessionId}/users/666/clear-companion-alert`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
