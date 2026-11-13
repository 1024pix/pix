import { expect } from 'chai';
import sinon from 'sinon';

import { CERTIFICATION_RESULT_STATUSES } from '../../../../../src/certification/results/domain/constants.ts';
import { CertificationResultsLinkByEmailToken } from '../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkByEmailToken.js';
import { CertificationResultsLinkToken } from '../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkToken.js';
import { ComplementaryCertificationKeys } from '../../../../../src/certification/shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../src/certification/shared/domain/models/JuryComment.js';
import { featureToggles } from '../../../../../src/shared/infrastructure/feature-toggles/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

describe('Certification | Results | Acceptance | Application | Routes | certification results', function () {
  describe('GET /api/sessions/{sessionId}/certified-clea-candidate-data', function () {
    it('should return 200 HTTP status code', async function () {
      // given
      const server = await getServer();
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
      context('FT readNewCertificationResults disabled', function () {
        beforeEach(async function () {
          await featureToggles.set('readNewCertificationResults', false);
        });

        it('should return 200 HTTP status code', async function () {
          // given
          const server = await getServer();

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

      context('FT readNewCertificationResults enabled', function () {
        beforeEach(async function () {
          await featureToggles.set('readNewCertificationResults', true);
        });

        it('should return 200 HTTP status code with the csv', async function () {
          // given
          const server = await getServer();
          const resultRecipientEmail = 'lepatron@example.net';
          const sessionId = databaseBuilder.factory.buildSession({ publishedAt: new Date() }).id;
          databaseBuilder.factory.learningContent.buildCompetence({
            id: 'competenceABC123',
            index: '1.1',
            origin: 'Pix',
          });
          databaseBuilder.factory.learningContent.buildCompetence({
            id: 'competenceDEF456',
            index: '2.2',
            origin: 'Pix',
          });
          buildCertificationResult(1, Frameworks.CORE, sessionId, resultRecipientEmail);
          buildCertificationResult(4, Frameworks.CLEA, sessionId, resultRecipientEmail);
          buildCertificationResult(5, Frameworks.DROIT, sessionId, resultRecipientEmail);
          await databaseBuilder.commit();

          const token = CertificationResultsLinkByEmailToken.generate({
            sessionId,
            resultRecipientEmail,
            daysBeforeExpiration: 30,
          });
          const request = {
            method: 'GET',
            url: `/api/sessions/download-results/${token}`,
            payload: {},
          };

          // when
          const response = await server.inject(request);

          // then
          expect(response.statusCode).to.equal(200);
          expect(response.result).to.deep
            .equal(`\uFEFF"Numéro de certification";"Prénom";"Nom";"Date de naissance";"Lieu de naissance";"Identifiant Externe";"Type de certification";"Statut";"Certification CléA";"Niveau";"Score en Pix";"1.1";"1.2";"1.3";"2.1";"2.2";"2.3";"2.4";"3.1";"3.2";"3.3";"3.4";"4.1";"4.2";"4.3";"5.1";"5.2";"Commentaire jury pour l’organisation";"Session";"Centre de certification";"Date de passage de la certification"
"1";"firstName 1";"lastName 1";"01/01/1990";"birthplace 1";"externalId 1";"Pix";"Non obtenue";"Non passée";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;"100000";"certificationCenter 1";"02/02/2026"
"4";"firstName 4";"lastName 4";"01/01/1990";"birthplace 4";"externalId 4";"CléA Numérique by Pix";"Non obtenue";"Non obtenue";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;"100000";"certificationCenter 4";"02/02/2026"
"5";"firstName 5";"lastName 5";"01/01/1990";"birthplace 5";"externalId 5";"Pix+ Droit";"Non obtenue";"Non passée";"-";"0";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";"-";;"100000";"certificationCenter 5";"02/02/2026"`);
        });
      });
    });
  });

  describe('POST /api/sessions/download-all-results', function () {
    context('when a valid token is given', function () {
      it('should return 200 HTTP status code', async function () {
        // given
        const server = await getServer();

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
        const server = await getServer();
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
        const server = await getServer();

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
        const server = await getServer();

        // when
        options.headers = {};
        const response = await server.inject(options);

        // then
        expect(response.statusCode).to.equal(401);
      });
    });
  });

  describe('GET /api/admin/sessions/download-selection-results', function () {
    const now = new Date('2026-01-01T05:06:07Z');

    beforeEach(function () {
      sinon.useFakeTimers({ now, toFake: ['Date'] });
    });

    it('should return 200 HTTP status code', async function () {
      // given
      const server = await getServer();

      const { id: userId } = databaseBuilder.factory.buildUser.withRoleSuperAdmin();

      const { id: sessionId1 } = databaseBuilder.factory.buildSession({ date: '2026-01-01' });
      const { id: sessionId2 } = databaseBuilder.factory.buildSession({ date: '2026-02-02' });

      const candidates = [
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: sessionId1,
        }),
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: sessionId1,
        }),
        databaseBuilder.factory.buildCertificationCandidate({
          sessionId: sessionId2,
        }),
      ];

      candidates.forEach((candidate) => {
        const certifCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: candidate.sessionId,
          userId: candidate.userId,
          lastName: candidate.lastName,
          birthdate: candidate.birthdate,
          createdAt: candidate.createdAt,
        });

        const assessment = databaseBuilder.factory.buildAssessment({
          certificationCourseId: certifCourse.id,
        });

        databaseBuilder.factory.buildAssessmentResult({
          assessmentId: assessment.id,
          createdAt: new Date('2018-04-15T00:00:00Z'),
        });
      });

      await databaseBuilder.commit();

      // when
      const response = await server.inject({
        method: 'GET',
        url: `/api/admin/sessions/download-selection-results?sessionIds=${sessionId1}&sessionIds=${sessionId2}`,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.headers['content-type']).to.equal('application/zip');
      expect(response.headers['content-disposition']).to.contain(
        'attachment; filename=pix-sessions-results-1767243967000.zip',
      );
    });
  });
});

function buildCertificationResult(certificationCourseId, framework, sessionId, resultRecipientEmail) {
  let pixScore = null,
    competenceMarks = null,
    competenceMarksForDBResult = null,
    hasAcquiredClea = null;
  if (framework === Frameworks.CORE || framework === Frameworks.CLEA) {
    pixScore = 678;
    competenceMarks = [
      {
        level: 1,
        competenceCode: '1.1',
      },
      {
        level: 7,
        competenceCode: '2.2',
      },
    ];
    competenceMarksForDBResult = [
      {
        level: 1,
        competenceId: 'competenceABC123',
      },
      {
        level: 7,
        competenceId: 'competenceDEF456',
      },
    ];
  }
  if (framework === Frameworks.CLEA) {
    hasAcquiredClea = true;
  }
  const data = {
    certificationId: certificationCourseId,
    firstName: `firstName ${certificationCourseId}`,
    lastName: `lastName ${certificationCourseId}`,
    birthdate: '1990-01-01',
    birthplace: `birthplace ${certificationCourseId}`,
    externalId: `externalId ${certificationCourseId}`,
    framework,
    status: CERTIFICATION_RESULT_STATUSES.REJECTED,
    reachedMeshIndex: 1,
    pixScore,
    competenceMarks,
    hasAcquiredClea,
    commentForOrganization: `commentForOrganization ${certificationCourseId}`,
    commentByAutoJury: AutoJuryCommentKeys.REJECTED_DUE_TO_ZERO_PIX_SCORE,
    certificationCenter: `certificationCenter ${certificationCourseId}`,
    startedAt: new Date('2026-02-02T15:00:00Z'),
    sessionId,
  };
  const userId = databaseBuilder.factory.buildUser().id;
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId,
    resultRecipientEmail,
  }).id;
  databaseBuilder.factory.buildCertificationCourse({
    id: certificationCourseId,
    sessionId,
    userId,
    candidateId,
  });
  const certificationResultId = databaseBuilder.factory.buildCertificationResult({
    id: `20000002-2002-2002-2002-20000000000${certificationCourseId}`,
    firstName: data.firstName,
    lastName: data.lastName,
    birthdate: data.birthdate,
    birthplace: data.birthplace,
    externalId: data.externalId,
    framework: data.framework,
    status: data.status,
    reachedMeshIndex: data.reachedMeshIndex,
    pixScore: data.pixScore,
    competenceMarks: competenceMarksForDBResult,
    hasAcquiredClea: data.hasAcquiredClea,
    commentForOrganization: data.commentForOrganization,
    commentByAutoJury: data.commentByAutoJury,
    certificationCenter: data.certificationCenter,
    startedAt: data.startedAt,
  }).id;
  databaseBuilder.factory.buildUserCertificationResult({
    userId,
    sessionId,
    certificationCourseId,
    certificationResultId,
  });
  return data;
}
