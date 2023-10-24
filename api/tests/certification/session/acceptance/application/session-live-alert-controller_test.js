import { databaseBuilder, expect, generateValidRequestAuthorizationHeader, knex } from '../../../../test-helper.js';
import { CertificationChallengeLiveAlertStatus } from '../../../../../src/certification/session/domain/models/CertificationChallengeLiveAlert.js';
import { createServer } from '../../../../../server.js';

describe('Certification | Session | Acceptance | Controller | session-live-alert-controller', function () {
  let server;

  beforeEach(async function () {
    server = await createServer();
  });

  afterEach(async function () {
    await knex('certification-issue-reports').delete();
  });

  describe('PATCH /sessions/{id}/candidates/{candidateId}/dismiss-live-alert', function () {
    describe('when user has supervisor authorization', function () {
      it('should return 204 when the alert is ongoing', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
        });
        const supervisorUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSupervisorAccess({ userId: supervisorUserId, sessionId: session.id });

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: certificationCourse.userId,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
        });

        const certificationChallengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });

        await databaseBuilder.commit();

        const headers = {
          authorization: generateValidRequestAuthorizationHeader(supervisorUserId, 'pix-certif'),
        };
        const options = {
          headers,
          method: 'PATCH',
          url: `/api/sessions/${certificationCourse.sessionId}/candidates/${certificationCourse.userId}/dismiss-live-alert`,
        };

        // when
        const response = await server.inject(options);

        const liveAlert = await knex('certification-challenge-live-alerts')
          .where({ id: certificationChallengeLiveAlert.id })
          .first();

        // then
        expect(response.statusCode).to.equal(204);
        expect(liveAlert.status).to.equal(CertificationChallengeLiveAlertStatus.DISMISSED);
      });
    });

    describe('when user does not have supervisor authorization', function () {
      it('should return 401 when the alert is ongoing', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
        });
        const supervisorUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSupervisorAccess({ userId: supervisorUserId, sessionId: session.id });

        const userNotLinkedToTheSessionId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();

        const headers = {
          authorization: generateValidRequestAuthorizationHeader(userNotLinkedToTheSessionId, 'pix-certif'),
        };
        const options = {
          headers,
          method: 'PATCH',
          url: `/api/sessions/${certificationCourse.sessionId}/candidates/${certificationCourse.userId}/dismiss-live-alert`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('PATCH /sessions/{id}/candidates/{candidateId}/validate-live-alert', function () {
    describe('when user has supervisor authorization', function () {
      it('should return 204 when the alert is ongoing', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
        });
        const supervisorUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildIssueReportCategory({
          name: 'IMAGE_NOT_DISPLAYING',
          issueReportCategoryId: 5,
        });
        databaseBuilder.factory.buildSupervisorAccess({ userId: supervisorUserId, sessionId: session.id });

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certificationCourse.id,
          userId: certificationCourse.userId,
        });

        databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.DISMISSED,
        });

        const certificationChallengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({
          assessmentId: assessment.id,
          status: CertificationChallengeLiveAlertStatus.ONGOING,
        });

        await databaseBuilder.commit();

        const headers = {
          authorization: generateValidRequestAuthorizationHeader(supervisorUserId, 'pix-certif'),
        };
        const options = {
          headers,
          method: 'PATCH',
          url: `/api/sessions/${certificationCourse.sessionId}/candidates/${certificationCourse.userId}/validate-live-alert`,
          payload: { subcategory: 'IMAGE_NOT_DISPLAYING' },
        };

        // when
        const response = await server.inject(options);

        const liveAlert = await knex('certification-challenge-live-alerts')
          .where({ id: certificationChallengeLiveAlert.id })
          .first();

        const certificationIssueReport = await knex('certification-issue-reports').first();

        // then
        expect(response.statusCode).to.equal(204);
        expect(liveAlert.status).to.equal(CertificationChallengeLiveAlertStatus.VALIDATED);
        expect(certificationIssueReport.subcategory).to.equal('IMAGE_NOT_DISPLAYING');
      });
    });

    describe('when user does not have supervisor authorization', function () {
      it('should return 401 when the alert is ongoing', async function () {
        // given
        const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
        const session = databaseBuilder.factory.buildSession({ certificationCenterId: certificationCenter.id });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
        });
        const supervisorUserId = databaseBuilder.factory.buildUser().id;
        databaseBuilder.factory.buildSupervisorAccess({ userId: supervisorUserId, sessionId: session.id });

        const userNotLinkedToTheSessionId = databaseBuilder.factory.buildUser().id;

        await databaseBuilder.commit();

        const headers = {
          authorization: generateValidRequestAuthorizationHeader(userNotLinkedToTheSessionId, 'pix-certif'),
        };
        const options = {
          headers,
          method: 'PATCH',
          url: `/api/sessions/${certificationCourse.sessionId}/candidates/${certificationCourse.userId}/validate-live-alert`,
        };

        // when
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
