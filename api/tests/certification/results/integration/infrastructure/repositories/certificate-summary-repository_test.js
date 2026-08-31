import { expect } from 'chai';

import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  EXTRA_CERTIFICATE_STATUSES,
} from '../../../../../../src/certification/results/domain/models/CertificateSummary.js';
import * as certificateSummaryRepository from '../../../../../../src/certification/results/infrastructure/repositories/certificate-summary-repository.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Infrastructure | Repository | Certification summary', function () {
  describe('#findByUserId', function () {
    describe('when the user has no certification taken', function () {
      it('should return an empty array', async function () {
        // given
        const user = databaseBuilder.factory.buildUser({});
        await databaseBuilder.commit();

        // when
        const certificationTaken = await certificateSummaryRepository.findByUserId({ userId: user.id });

        // then
        expect(certificationTaken).to.be.empty;
      });
    });

    describe('when the user has no certification scored', function () {
      it('should return an empty array', async function () {
        // given
        const session = databaseBuilder.factory.buildSession({
          certificationCenter: 'Centre de certif pix',
        });
        const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
          sessionId: session.id,
          framework: Frameworks.CORE,
        });
        await databaseBuilder.commit();

        // when
        const certificationTaken = await certificateSummaryRepository.findByUserId({
          userId: certificationCourse.userId,
        });

        // then
        expect(certificationTaken).to.be.empty;
      });
    });

    describe('for v2 certifications', function () {
      describe('when the user has a core certification taken', function () {
        it('should return an array with the certificate summary', async function () {
          // given
          const session = databaseBuilder.factory.buildSession({
            certificationCenter: 'Centre de certif pix',
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            framework: Frameworks.CORE,
            version: AlgorithmEngineVersion.V2,
          });
          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            status: AssessmentResult.status.VALIDATED,
            commentForCandidate: 'blabla',
            reachedMeshIndex: null,
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: certificationCourse.id,
            lastAssessmentResultId: assessmentResult.id,
          });
          await databaseBuilder.commit();

          // when
          const certificationTaken = await certificateSummaryRepository.findByUserId({
            userId: certificationCourse.userId,
          });

          // then
          expect(certificationTaken).to.deepEqualArray([
            domainBuilder.certification.results.buildCertificateSummary({
              id: certificationCourse.id,
              certificationCenterName: session.certificationCenter,
              certificationFramework: certificationCourse.framework,
              certificationStartedAt: certificationCourse.createdAt,
              extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
              juryComment: {
                commentByAutoJury: undefined,
                fallbackComment: assessmentResult.commentForCandidate,
              },
              pixScore: assessmentResult.pixScore,
              status: CERTIFICATE_STATUSES.VALIDATED,
              verificationCode: certificationCourse.verificationCode,
              certificateType: CERTIFICATE_TYPES.ATTESTATION,
              reachedMeshLevel: null,
            }),
          ]);
        });
      });

      describe('when the user has a double certifications taken', function () {
        describe('when the certification has a complementary', function () {
          it('should return an array with the certificate summary', async function () {
            // given
            const session = databaseBuilder.factory.buildSession({
              certificationCenter: 'Centre de certif pix',
            });

            const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
              sessionId: session.id,
              framework: Frameworks.EDU_1ER_DEGRE,
              version: AlgorithmEngineVersion.V2,
            });
            const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
              status: AssessmentResult.status.VALIDATED,
              reachedMeshIndex: null,
            });
            databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
              certificationCourseId: certificationCourse.id,
              lastAssessmentResultId: assessmentResult.id,
            });

            const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
              certificationCourseId: certificationCourse.id,
            });
            databaseBuilder.factory.buildComplementaryCertificationCourseResult({
              source: ComplementaryCertificationCourseResult.sources.PIX,
              acquired: true,
              complementaryCertificationCourseId: complementaryCertificationCourse.id,
              complementaryCertificationBadgeId: complementaryCertificationCourse.complementaryCertificationBadgeId,
            });
            databaseBuilder.factory.buildComplementaryCertificationCourseResult({
              source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
              acquired: true,
              complementaryCertificationCourseId: complementaryCertificationCourse.id,
              complementaryCertificationBadgeId: complementaryCertificationCourse.complementaryCertificationBadgeId,
            });

            await databaseBuilder.commit();

            // when
            const certificationTaken = await certificateSummaryRepository.findByUserId({
              userId: certificationCourse.userId,
            });

            // then
            expect(certificationTaken).to.deepEqualArray([
              domainBuilder.certification.results.buildCertificateSummary({
                id: certificationCourse.id,
                certificationCenterName: session.certificationCenter,
                certificationFramework: certificationCourse.framework,
                certificationStartedAt: certificationCourse.createdAt,
                extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
                juryComment: {
                  commentByAutoJury: undefined,
                  fallbackComment: assessmentResult.commentForCandidate,
                },
                pixScore: assessmentResult.pixScore,
                status: CERTIFICATE_STATUSES.VALIDATED,
                verificationCode: certificationCourse.verificationCode,
                certificateType: CERTIFICATE_TYPES.ATTESTATION,
                reachedMeshLevel: null,
              }),
            ]);
          });
        });
      });
    });

    describe('for v3 certifications', function () {
      describe('when the user has a core certification taken', function () {
        it('should return an array with the certificate summary', async function () {
          // given
          const session = databaseBuilder.factory.buildSession({
            certificationCenter: 'Centre de certif pix',
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            framework: Frameworks.CORE,
            version: AlgorithmEngineVersion.V3,
          });
          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            status: AssessmentResult.status.VALIDATED,
            commentForCandidate: 'blabla',
            reachedMeshIndex: 1,
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: certificationCourse.id,
            lastAssessmentResultId: assessmentResult.id,
          });
          await databaseBuilder.commit();

          // when
          const certificationTaken = await certificateSummaryRepository.findByUserId({
            userId: certificationCourse.userId,
          });

          // then
          expect(certificationTaken).to.deepEqualArray([
            domainBuilder.certification.results.buildCertificateSummary({
              id: certificationCourse.id,
              certificationCenterName: session.certificationCenter,
              certificationFramework: certificationCourse.framework,
              certificationStartedAt: certificationCourse.createdAt,
              extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
              juryComment: {
                commentByAutoJury: undefined,
                fallbackComment: assessmentResult.commentForCandidate,
              },
              pixScore: assessmentResult.pixScore,
              status: CERTIFICATE_STATUSES.VALIDATED,
              verificationCode: certificationCourse.verificationCode,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: 'LEVEL_BEGINNER_1',
            }),
          ]);
        });
      });

      describe('when the user has a Pix+ certification taken', function () {
        it('should return an array with the certificate summary', async function () {
          // given
          const session = databaseBuilder.factory.buildSession({
            certificationCenter: 'Centre de certif pix',
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            framework: Frameworks.DROIT,
            version: AlgorithmEngineVersion.V3,
          });
          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            status: AssessmentResult.status.VALIDATED,
            commentForCandidate: 'blabla',
            reachedMeshIndex: 3,
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: certificationCourse.id,
            lastAssessmentResultId: assessmentResult.id,
          });
          await databaseBuilder.commit();

          // when
          const certificationTaken = await certificateSummaryRepository.findByUserId({
            userId: certificationCourse.userId,
          });

          // then
          expect(certificationTaken).to.deepEqualArray([
            domainBuilder.certification.results.buildCertificateSummary({
              id: certificationCourse.id,
              certificationCenterName: session.certificationCenter,
              certificationFramework: certificationCourse.framework,
              certificationStartedAt: certificationCourse.createdAt,
              extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
              juryComment: {
                commentByAutoJury: undefined,
                fallbackComment: assessmentResult.commentForCandidate,
              },
              pixScore: assessmentResult.pixScore,
              status: CERTIFICATE_STATUSES.VALIDATED,
              verificationCode: certificationCourse.verificationCode,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: 'LEVEL_EXPERT',
            }),
          ]);
        });
      });

      describe('when the user has a Pix+ EDU certification with an external jury result', function () {
        it('should return an array with the certificate summary using the external jury level', async function () {
          // given
          const session = databaseBuilder.factory.buildSession({
            certificationCenter: 'Centre de certif pix',
          });
          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            framework: Frameworks.EDU_2ND_DEGRE,
            version: AlgorithmEngineVersion.V3,
          });
          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            status: AssessmentResult.status.VALIDATED,
            commentForCandidate: 'blabla',
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: 'EXPERT',
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: certificationCourse.id,
            lastAssessmentResultId: assessmentResult.id,
          });
          await databaseBuilder.commit();

          // when
          const certificationTaken = await certificateSummaryRepository.findByUserId({
            userId: certificationCourse.userId,
          });

          // then
          expect(certificationTaken).to.deepEqualArray([
            domainBuilder.certification.results.buildCertificateSummary({
              id: certificationCourse.id,
              certificationCenterName: session.certificationCenter,
              certificationFramework: certificationCourse.framework,
              certificationStartedAt: certificationCourse.createdAt,
              extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
              juryComment: {
                commentByAutoJury: undefined,
                fallbackComment: assessmentResult.commentForCandidate,
              },
              pixScore: assessmentResult.pixScore,
              status: CERTIFICATE_STATUSES.VALIDATED,
              verificationCode: certificationCourse.verificationCode,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: 'LEVEL_EXPERT',
            }),
          ]);
        });
      });

      describe('when the user has a double certifications taken', function () {
        it('should return an array with the certificate summary', async function () {
          // given
          const session = databaseBuilder.factory.buildSession({
            certificationCenter: 'Centre de certif pix',
          });

          const certificationCourse = databaseBuilder.factory.buildCertificationCourse({
            sessionId: session.id,
            framework: Frameworks.CLEA,
            version: AlgorithmEngineVersion.V3,
          });
          const assessmentResult = databaseBuilder.factory.buildAssessmentResult({
            status: AssessmentResult.status.VALIDATED,
            reachedMeshIndex: null,
          });
          databaseBuilder.factory.buildCertificationCourseLastAssessmentResult({
            certificationCourseId: certificationCourse.id,
            lastAssessmentResultId: assessmentResult.id,
          });

          const complementaryCertificationCourse = databaseBuilder.factory.buildComplementaryCertificationCourse({
            certificationCourseId: certificationCourse.id,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            source: ComplementaryCertificationCourseResult.sources.PIX,
            acquired: true,
            complementaryCertificationCourseId: complementaryCertificationCourse.id,
            complementaryCertificationBadgeId: complementaryCertificationCourse.complementaryCertificationBadgeId,
          });
          databaseBuilder.factory.buildComplementaryCertificationCourseResult({
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            acquired: true,
            complementaryCertificationCourseId: complementaryCertificationCourse.id,
            complementaryCertificationBadgeId: complementaryCertificationCourse.complementaryCertificationBadgeId,
          });

          await databaseBuilder.commit();

          // when
          const certificationTaken = await certificateSummaryRepository.findByUserId({
            userId: certificationCourse.userId,
          });

          // then
          expect(certificationTaken).to.deepEqualArray([
            domainBuilder.certification.results.buildCertificateSummary({
              id: certificationCourse.id,
              certificationCenterName: session.certificationCenter,
              certificationFramework: certificationCourse.framework,
              certificationStartedAt: certificationCourse.createdAt,
              extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
              juryComment: {
                commentByAutoJury: undefined,
                fallbackComment: assessmentResult.commentForCandidate,
              },
              pixScore: assessmentResult.pixScore,
              status: CERTIFICATE_STATUSES.VALIDATED,
              verificationCode: certificationCourse.verificationCode,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: null,
            }),
          ]);
        });
      });
    });
  });
});
