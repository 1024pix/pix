import { createServer } from '../../../../../server.js';
import { CertificationResultsLinkByEmailToken } from '../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkByEmailToken.js';
import { CertificationResultsLinkToken } from '../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkToken.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Results | Acceptance | Application | Routes | certification results', function () {
  describe('GET /api/sessions/{sessionId}/certified-clea-candidate-data', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await createServer();
      const dbf = databaseBuilder.factory;

      const user = dbf.buildUser();
      databaseBuilder.factory.buildOrganization({ externalId: 'EXT1234' });
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({ externalId: 'EXT1234' }).id;
      databaseBuilder.factory.buildCertificationCenterMembership({ userId: user.id, certificationCenterId });
      const sessionId = dbf.buildSession({ certificationCenterId, date: '2020/01/01', time: '12:00' }).id;

      const certificationCourse = dbf.buildCertificationCourse({ sessionId, userId: user.id });
      dbf.buildComplementaryCertification({
        id: 1,
        key: ComplementaryCertificationKeys.CLEA,
      });
      const badgeClea = databaseBuilder.factory.buildBadge({ id: 1, isCertifiable: true });
      const complementaryCertificationBadgeId = databaseBuilder.factory.buildComplementaryCertificationBadge({
        complementaryCertificationId: 1,
        badgeId: badgeClea.id,
      }).id;
      const complementaryCertificationCourse = dbf.buildComplementaryCertificationCourse({
        certificationCourseId: certificationCourse.id,
        complementaryCertificationId: 1,
        complementaryCertificationBadgeId,
      });
      dbf.buildComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: complementaryCertificationCourse.id,
        complementaryCertificationBadgeId,
        acquired: true,
      });

      const request = {
        method: 'GET',
        url: `/api/sessions/${sessionId}/certified-clea-candidate-data`,
        headers: generateAuthenticatedUserRequestHeaders({ userId: user.id }),
      };

      await databaseBuilder.commit();

      // when
      const response = await server.inject(request);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('GET /api/sessions/download-results/{token}', function () {
    context('when a valid token is given', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const server = await createServer();

        const dbf = databaseBuilder.factory;

        const session = dbf.buildSession({ date: '2020/01/01', time: '12:00' });
        const sessionId = session.id;

        const candidate1 = dbf.buildCertificationCandidate({
          sessionId,
          resultRecipientEmail: 'recipientEmail@example.net',
        });
        const candidate2 = dbf.buildCertificationCandidate({
          sessionId,
          resultRecipientEmail: 'recipientEmail@example.net',
        });

        const certif1 = dbf.buildCertificationCourse({
          sessionId: candidate1.sessionId,
          userId: candidate1.userId,
          lastName: candidate1.lastName,
          birthdate: candidate1.birthdate,
          createdAt: candidate1.createdAt,
        });
        const certif2 = dbf.buildCertificationCourse({
          sessionId: candidate2.sessionId,
          userId: candidate2.userId,
          lastName: candidate2.lastName,
          birthdate: candidate2.birthdate,
          createdAt: candidate1.createdAt,
        });

        const assessmentId1 = dbf.buildAssessment({ certificationCourseId: certif1.id }).id;
        dbf.buildAssessment({ certificationCourseId: certif2.id });

        dbf.buildAssessmentResult({ assessmentId: assessmentId1, createdAt: new Date('2018-04-15T00:00:00Z') });

        const token = CertificationResultsLinkByEmailToken.generate({
          sessionId,
          resultRecipientEmail: 'recipientEmail@example.net',
          daysBeforeExpiration: 30,
        });

        const request = {
          method: 'GET',
          url: `/api/sessions/download-results/${token}`,
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

  describe('POST /api/sessions/download-all-results', function () {
    context('when a valid token is given', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const server = await createServer();

        const dbf = databaseBuilder.factory;

        const session = dbf.buildSession({ date: '2020/01/01', time: '12:00' });
        const sessionId = session.id;

        const candidate1 = dbf.buildCertificationCandidate({
          sessionId,
          resultRecipientEmail: 'recipientEmail@example.net',
        });
        const candidate2 = dbf.buildCertificationCandidate({
          sessionId,
          resultRecipientEmail: 'recipientEmail@example.net',
        });

        const certif1 = dbf.buildCertificationCourse({
          sessionId: candidate1.sessionId,
          userId: candidate1.userId,
          lastName: candidate1.lastName,
          birthdate: candidate1.birthdate,
          createdAt: candidate1.createdAt,
        });
        const certif2 = dbf.buildCertificationCourse({
          sessionId: candidate2.sessionId,
          userId: candidate2.userId,
          lastName: candidate2.lastName,
          birthdate: candidate2.birthdate,
          createdAt: candidate2.createdAt,
        });

        const assessmentId1 = dbf.buildAssessment({ certificationCourseId: certif1.id }).id;
        dbf.buildAssessment({
          certificationCourseId: certif2.id,
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        });

        dbf.buildAssessmentResult({ assessmentId: assessmentId1, createdAt: new Date('2018-04-15T00:00:00Z') });

        const token = CertificationResultsLinkToken.generate({ sessionId });

        const request = {
          method: 'POST',
          url: `/api/sessions/download-all-results`,
          payload: { token },
        };

        await databaseBuilder.commit();

        // when
        const response = await server.inject(request);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
  });

  describe('GET /api/admin/sessions/{sessionId}/generate-results-download-link', function () {
    context('when user is Super Admin', function () {
      it('should return a 200 status code response', async function () {
        // given
        const sessionId = 121;
        const options = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/generate-results-download-link`,
          payload: {},
        };
        const server = await createServer();
        const superAdmin = databaseBuilder.factory.buildUser.withRoleSuperAdmin();
        databaseBuilder.factory.buildSession({ id: 121 });
        await databaseBuilder.commit();

        // when
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: superAdmin.id });
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    context('when user is not SuperAdmin', function () {
      it('should return 403 HTTP status code', async function () {
        // given
        const sessionId = 121;
        const options = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/generate-results-download-link`,
          payload: {},
        };
        const server = await createServer();

        // when
        options.headers = generateAuthenticatedUserRequestHeaders({ userId: 1111 });
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(403);
      });
    });

    context('when user is not connected', function () {
      it('should return 401 HTTP status code if user is not authenticated', async function () {
        // given
        const sessionId = 121;
        const options = {
          method: 'GET',
          url: `/api/admin/sessions/${sessionId}/generate-results-download-link`,
          payload: {},
        };
        const server = await createServer();

        // when
        options.headers = {};
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });
});
