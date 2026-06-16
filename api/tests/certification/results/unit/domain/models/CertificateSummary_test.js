import {
  CERTIFICATE_STATUSES,
  CERTIFICATE_TYPES,
  CertificateSummary,
  EXTRA_CERTIFICATE_STATUSES,
} from '../../../../../../src/certification/results/domain/models/CertificateSummary.js';
import { PIX_PLUS_EDU_EXTERNAL_LEVELS } from '../../../../../../src/certification/shared/domain/constants/mesh-configuration.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import {
  JuryComment,
  JuryCommentContexts,
} from '../../../../../../src/certification/shared/domain/models/JuryComment.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/AssessmentResult.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
describe('Unit | Domain | Models | CertificationSummary', function () {
  context('#static buildFrom', function () {
    const baseData = {
      id: 123,
      verificationCode: 'some verification code',
      certificationStartedAt: new Date(),
      certificationFramework: Frameworks.CORE,
      certificationCenterName: 'some certification center',
      pixScore: 123,
      commentForCandidate: 'some comment for candidate',
      commentByAutoJury: 'some comment for auto jury',
      algorithmVersion: AlgorithmEngineVersion.V3,
      reachedMeshIndex: 1,
    };

    context('status computation', function () {
      context('when certification is not published', function () {
        [
          AssessmentResult.status.REJECTED,
          AssessmentResult.status.VALIDATED,
          AssessmentResult.status.CANCELLED,
        ].forEach((assessmentResultStatus) => {
          it(`should set the status of the certificate as WAIT_FOR_RESULTS and reachedMeshLevel to null when assessment result status is ${assessmentResultStatus}`, function () {
            const actualCertificateSummary = CertificateSummary.buildFrom({
              ...baseData,
              assessmentResultStatus,
              isPublished: false,
              isExtraCertificationAcquired: true,
            });

            const expectedCertificateSummary = domainBuilder.certification.results.buildCertificateSummary({
              ...baseData,
              juryComment: new JuryComment({
                commentByAutoJury: baseData.commentByAutoJury,
                fallbackComment: baseData.commentForCandidate,
                context: JuryCommentContexts.CANDIDATE,
              }),
              status: CERTIFICATE_STATUSES.WAITING_FOR_RESULTS,
              extraCertificationStatus: null,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: null,
            });

            expect(actualCertificateSummary).to.deepEqualInstance(expectedCertificateSummary);
          });
        });
      });

      context('when certification is published', function () {
        [
          {
            assessmentResultStatus: AssessmentResult.status.REJECTED,
            status: CERTIFICATE_STATUSES.REJECTED,
            extraStatus: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
            expectedReachedMeshLevel: null,
          },
          {
            assessmentResultStatus: AssessmentResult.status.CANCELLED,
            status: CERTIFICATE_STATUSES.CANCELLED,
            extraStatus: null,
            expectedReachedMeshLevel: 'LEVEL_BEGINNER_1',
          },
          {
            assessmentResultStatus: AssessmentResult.status.VALIDATED,
            status: CERTIFICATE_STATUSES.VALIDATED,
            extraStatus: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
            expectedReachedMeshLevel: 'LEVEL_BEGINNER_1',
          },
        ].forEach(({ assessmentResultStatus, status, extraStatus, expectedReachedMeshLevel }) => {
          it(`should set the status of the certificate as ${status} when assessment result status is ${assessmentResultStatus}`, function () {
            const actualCertificateSummary = CertificateSummary.buildFrom({
              ...baseData,
              assessmentResultStatus,
              isPublished: true,
              isExtraCertificationAcquired: true,
            });

            const expectedCertificateSummary = domainBuilder.certification.results.buildCertificateSummary({
              ...baseData,
              juryComment: new JuryComment({
                commentByAutoJury: baseData.commentByAutoJury,
                fallbackComment: baseData.commentForCandidate,
                context: JuryCommentContexts.CANDIDATE,
              }),
              status,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              extraCertificationStatus: extraStatus,
              reachedMeshLevel: expectedReachedMeshLevel,
            });

            expect(actualCertificateSummary).to.deepEqualInstance(expectedCertificateSummary);
          });
        });
      });
    });

    context('extra status computation', function () {
      context('when certification is not published', function () {
        [true, false, null].forEach((isExtraCertificationAcquired) => {
          it(`should set the extra certification status of the certificate as WAIT_FOR_RESULTS when "isExtraCertificationAcquired" is ${isExtraCertificationAcquired}`, function () {
            const actualCertificateSummary = CertificateSummary.buildFrom({
              ...baseData,
              isExtraCertificationAcquired,
              assessmentResultStatus: null,
              isPublished: false,
            });

            const expectedCertificateSummary = domainBuilder.certification.results.buildCertificateSummary({
              ...baseData,
              juryComment: new JuryComment({
                commentByAutoJury: baseData.commentByAutoJury,
                fallbackComment: baseData.commentForCandidate,
                context: JuryCommentContexts.CANDIDATE,
              }),
              status: CERTIFICATE_STATUSES.WAITING_FOR_RESULTS,
              extraCertificationStatus: null,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: null,
            });

            expect(actualCertificateSummary).to.deepEqualInstance(expectedCertificateSummary);
          });
        });
      });

      context('when certification is published', function () {
        [
          {
            isExtraCertificationAcquired: true,
            extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.ACQUIRED,
          },
          {
            isExtraCertificationAcquired: false,
            extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_ACQUIRED,
          },
          {
            isExtraCertificationAcquired: null,
            extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
          },
        ].forEach(({ isExtraCertificationAcquired, extraCertificationStatus }) => {
          it(`should set the extra certification status of the certificate as ${extraCertificationStatus} when "isExtraCertificationAcquired" is ${isExtraCertificationAcquired}`, function () {
            const actualCertificateSummary = CertificateSummary.buildFrom({
              ...baseData,
              assessmentResultStatus: AssessmentResult.status.VALIDATED,
              isPublished: true,
              isExtraCertificationAcquired,
            });

            const expectedCertificateSummary = domainBuilder.certification.results.buildCertificateSummary({
              ...baseData,
              juryComment: new JuryComment({
                commentByAutoJury: baseData.commentByAutoJury,
                fallbackComment: baseData.commentForCandidate,
                context: JuryCommentContexts.CANDIDATE,
              }),
              status: CERTIFICATE_STATUSES.VALIDATED,
              extraCertificationStatus,
              certificateType: CERTIFICATE_TYPES.CERTIFICATE,
              reachedMeshLevel: 'LEVEL_BEGINNER_1',
            });

            expect(actualCertificateSummary).to.deepEqualInstance(expectedCertificateSummary);
          });
        });
      });
    });

    context('reachedMeshLevel computation', function () {
      context('when certification is V3 and rejected', function () {
        it('should set reachedMeshLevel to null', function () {
          // when
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            algorithmVersion: AlgorithmEngineVersion.V3,
            assessmentResultStatus: AssessmentResult.status.REJECTED,
            isPublished: true,
            isExtraCertificationAcquired: false,
            reachedMeshIndex: 0,
          });

          // then
          expect(actualCertificateSummary.reachedMeshLevel).to.be.null;
        });
      });

      context('when certification is V3 and not rejected', function () {
        it('should convert reachedMeshIndex to the corresponding level key', function () {
          // when
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            algorithmVersion: AlgorithmEngineVersion.V3,
            assessmentResultStatus: AssessmentResult.status.VALIDATED,
            isPublished: true,
            isExtraCertificationAcquired: false,
            reachedMeshIndex: 0,
          });

          // then
          expect(actualCertificateSummary.reachedMeshLevel).to.equal('LEVEL_PRE_BEGINNER');
        });
      });

      context('when certification is not V3', function () {
        it('should convert reachedMeshIndex to the corresponding level key regardless of status', function () {
          // when
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            algorithmVersion: AlgorithmEngineVersion.V2,
            assessmentResultStatus: AssessmentResult.status.REJECTED,
            isPublished: true,
            isExtraCertificationAcquired: false,
            reachedMeshIndex: 3,
          });

          // then
          expect(actualCertificateSummary.reachedMeshLevel).to.equal('LEVEL_INDEPENDENT_3');
        });
      });

      context('when certification is Pix+ EDU and not published', function () {
        it('should set reachedMeshLevel to null and status to WAITING_FOR_RESULTS regardless of the external jury result', function () {
          // when
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            certificationFramework: Frameworks.EDU_2ND_DEGRE,
            algorithmVersion: AlgorithmEngineVersion.V3,
            assessmentResultStatus: AssessmentResult.status.VALIDATED,
            isPublished: false,
            isExtraCertificationAcquired: true,
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
          });

          // then
          expect(actualCertificateSummary.reachedMeshLevel).to.be.null;
          expect(actualCertificateSummary.status).to.equal(CERTIFICATE_STATUSES.WAITING_FOR_RESULTS);
        });
      });

      context('when certification is Pix+ V3 EDU with an external jury result', function () {
        it('should pass eduV3ExternalJuryResult through to CertificateMeshLevel', function () {
          // when
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            certificationFramework: Frameworks.EDU_2ND_DEGRE,
            algorithmVersion: AlgorithmEngineVersion.V3,
            assessmentResultStatus: AssessmentResult.status.VALIDATED,
            isPublished: true,
            isExtraCertificationAcquired: true,
            reachedMeshIndex: 0,
            eduV3ExternalJuryResult: PIX_PLUS_EDU_EXTERNAL_LEVELS.ADVANCED,
          });

          // then
          expect(actualCertificateSummary.reachedMeshLevel).to.equal('LEVEL_ADVANCED');
        });
      });
    });

    context('certificate type computation', function () {
      [
        {
          algorithmVersion: AlgorithmEngineVersion.V1,
          certificateType: CERTIFICATE_TYPES.ATTESTATION,
        },
        {
          algorithmVersion: AlgorithmEngineVersion.V2,
          certificateType: CERTIFICATE_TYPES.ATTESTATION,
        },
        {
          algorithmVersion: AlgorithmEngineVersion.V3,
          certificateType: CERTIFICATE_TYPES.CERTIFICATE,
        },
      ].forEach(({ algorithmVersion, certificateType }) => {
        it(`should be a certificate of type ${certificateType} when algorithmVersion is ${algorithmVersion}`, function () {
          const actualCertificateSummary = CertificateSummary.buildFrom({
            ...baseData,
            assessmentResultStatus: AssessmentResult.status.VALIDATED,
            isPublished: true,
            isExtraCertificationAcquired: null,
            algorithmVersion,
          });

          const expectedCertificateSummary = domainBuilder.certification.results.buildCertificateSummary({
            ...baseData,
            juryComment: new JuryComment({
              commentByAutoJury: baseData.commentByAutoJury,
              fallbackComment: baseData.commentForCandidate,
              context: JuryCommentContexts.CANDIDATE,
            }),
            status: CERTIFICATE_STATUSES.VALIDATED,
            extraCertificationStatus: EXTRA_CERTIFICATE_STATUSES.NOT_APPLICABLE,
            certificateType,
            reachedMeshLevel: 'LEVEL_BEGINNER_1',
          });

          expect(actualCertificateSummary).to.deepEqualInstance(expectedCertificateSummary);
        });
      });
    });
  });
});
