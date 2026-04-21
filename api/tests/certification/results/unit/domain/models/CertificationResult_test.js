import { CertificationResult } from '../../../../../../src/certification/results/domain/models/CertificationResult.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { AutoJuryCommentKeys } from '../../../../../../src/certification/shared/domain/models/JuryComment.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

const CERTIFICATION_RESULT_STATUS_CANCELLED = CertificationResult.status.CANCELLED;
const CERTIFICATION_RESULT_STATUS_ERROR = CertificationResult.status.ERROR;
const CERTIFICATION_RESULT_STATUS_REJECTED = CertificationResult.status.REJECTED;
const CERTIFICATION_RESULT_STATUS_STARTED = CertificationResult.status.STARTED;
const CERTIFICATION_RESULT_STATUS_VALIDATED = CertificationResult.status.VALIDATED;

describe('Unit | Domain | Models | CertificationResult', function () {
  context('#static from', function () {
    let certificationResultData;

    beforeEach(function () {
      certificationResultData = {
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        version: 2,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        reachedMeshIndex: 2,
        framework: 'CORE',
        commentForOrganization: 'Un commentaire orga 1',
        juryId: 159,
        competenceMarks: [
          {
            id: 123,
            score: 10,
            level: 4,
            area_code: 2,
            competence_code: '2.3',
            assessmentResultId: 753,
            competenceId: 'recComp23',
          },
        ],
        complementaryCertificationCourseResults: [],
      };
    });

    it('should build a CertificationResult from certification result DTO', function () {
      // given
      const certificationResultDTO = {
        ...certificationResultData,
        assessmentResultStatus: CERTIFICATION_RESULT_STATUS_VALIDATED,
      };

      // when
      const certificationResult = CertificationResult.from({
        certificationResultDTO,
      });

      // then
      const expectedCertificationResult = domainBuilder.buildCertificationResult({
        id: 123,
        firstName: 'Buffy',
        lastName: 'Summers',
        birthdate: '1981-01-19',
        birthplace: 'Torreilles',
        isPublished: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        version: AlgorithmEngineVersion.V2,
        reachedMeshIndex: 2,
        framework: 'CORE',
        status: CERTIFICATION_RESULT_STATUS_VALIDATED,
        commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
          fallbackComment: certificationResultData.commentForOrganization,
        }),
        juryId: 159,
        competencesWithMark: [
          domainBuilder.buildCompetenceMark({
            id: 123,
            level: 4,
            score: 10,
            area_code: '2',
            competence_code: '2.3',
            competenceId: 'recComp23',
            assessmentResultId: 753,
          }),
        ],
        complementaryCertificationCourseResults: [],
      });
      expect(certificationResult).to.deepEqualInstance(expectedCertificationResult);
    });

    context('when there is an automatic jury comment', function () {
      it('should build a CertificationResult from certification', function () {
        // given
        const certificationResultDTO = {
          ...certificationResultData,
          commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
        };

        // when
        const certificationResult = CertificationResult.from({
          certificationResultDTO,
        });

        // then
        const { commentForOrganization: expectedCommentForOrganization } = domainBuilder.buildCertificationResult({
          ...certificationResultDTO,
          commentForOrganization: domainBuilder.certification.shared.buildJuryComment.organization({
            fallbackComment: certificationResultDTO.commentForOrganization,
            commentByAutoJury: AutoJuryCommentKeys.CANCELLED_DUE_TO_NEUTRALIZATION,
          }),
        });

        expect(certificationResult.commentForOrganization).to.deepEqualInstance(expectedCommentForOrganization);
      });
    });

    context('status', function () {
      [
        {
          statusName: 'cancelled',
          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_CANCELLED,
          validationFunction: 'isCancelled',
        },
        {
          statusName: 'validated',
          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_VALIDATED,
          validationFunction: 'isValidated',
        },
        {
          statusName: 'rejected',
          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_REJECTED,
          validationFunction: 'isRejected',
        },
        {
          statusName: 'error',
          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_ERROR,
          validationFunction: 'isInError',
        },

        { statusName: 'started', assessmentResultStatus: null, validationFunction: 'isStarted' },
      ].forEach(function (testCase) {
        it(`should build a ${testCase.statusName} CertificationResult`, async function () {
          // given
          const certificationResultDTO = {
            ...certificationResultData,
            assessmentResultStatus: testCase.assessmentResultStatus,
          };
          // when
          const certificationResult = CertificationResult.from({
            certificationResultDTO,
          });

          // then
          expect(certificationResult[testCase.validationFunction]()).to.be.true;
        });
      });
    });
  });

  context('#isCancelled', function () {
    it('returns true if status is "cancelled"', function () {
      // given
      const cancelledCertificationResult = domainBuilder.buildCertificationResult({
        status: CERTIFICATION_RESULT_STATUS_CANCELLED,
      });

      // when / then
      expect(cancelledCertificationResult.isCancelled()).to.be.true;
    });

    [
      { statusName: 'validated', status: CERTIFICATION_RESULT_STATUS_VALIDATED },

      { statusName: 'rejected', status: CERTIFICATION_RESULT_STATUS_REJECTED },

      { statusName: 'error', status: CERTIFICATION_RESULT_STATUS_ERROR },

      { statusName: 'started', status: CERTIFICATION_RESULT_STATUS_STARTED },
    ].forEach(function (testCase) {
      it(`should return false when status is ${testCase.statusName}`, async function () {
        // given
        const notCancelledCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isCancelled = notCancelledCertificationResult.isCancelled();

        // then
        expect(isCancelled).to.be.false;
      });
    });
  });

  context('#isValidated', function () {
    it('returns true if status is "validated"', function () {
      // given
      const validatedCertificationResult = domainBuilder.buildCertificationResult({
        status: CERTIFICATION_RESULT_STATUS_VALIDATED,
      });

      // when
      const isValidated = validatedCertificationResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    [
      { statusName: 'cancelled', status: CERTIFICATION_RESULT_STATUS_CANCELLED },

      { statusName: 'rejected', status: CERTIFICATION_RESULT_STATUS_REJECTED },

      { statusName: 'error', status: CERTIFICATION_RESULT_STATUS_ERROR },

      { statusName: 'started', status: CERTIFICATION_RESULT_STATUS_STARTED },
    ].forEach(function (testCase) {
      it(`should return false when status is ${testCase.statusName}`, async function () {
        // given
        const notValidatedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isValidated = notValidatedCertificationResult.isValidated();

        // then
        expect(isValidated).to.be.false;
      });
    });
  });

  context('#isRejected', function () {
    it('returns true if status is "rejected"', function () {
      // given
      const rejectedCertificationResult = domainBuilder.buildCertificationResult({
        status: CERTIFICATION_RESULT_STATUS_REJECTED,
      });

      // when
      const isRejected = rejectedCertificationResult.isRejected();

      // then
      expect(isRejected).to.be.true;
    });

    [
      { statusName: 'cancelled', status: CERTIFICATION_RESULT_STATUS_CANCELLED },

      { statusName: 'validated', status: CERTIFICATION_RESULT_STATUS_VALIDATED },

      { statusName: 'error', status: CERTIFICATION_RESULT_STATUS_ERROR },

      { statusName: 'started', status: CERTIFICATION_RESULT_STATUS_STARTED },
    ].forEach(function (testCase) {
      it(`should return false when status is ${testCase.statusName}`, async function () {
        // given
        const notRejectedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isRejected = notRejectedCertificationResult.isRejected();

        // then
        expect(isRejected).to.be.false;
      });
    });
  });

  context('#isInError', function () {
    it('returns true if status is "error"', function () {
      // given
      const errorCertificationResult = domainBuilder.buildCertificationResult({
        status: CERTIFICATION_RESULT_STATUS_ERROR,
      });

      // when
      const isInError = errorCertificationResult.isInError();

      // then
      expect(isInError).to.be.true;
    });

    [
      { statusName: 'cancelled', status: CERTIFICATION_RESULT_STATUS_CANCELLED },

      { statusName: 'validated', status: CERTIFICATION_RESULT_STATUS_VALIDATED },

      { statusName: 'rejected', status: CERTIFICATION_RESULT_STATUS_REJECTED },

      { statusName: 'started', status: CERTIFICATION_RESULT_STATUS_STARTED },
    ].forEach(function (testCase) {
      it(`should return false when status is ${testCase.statusName}`, async function () {
        // given
        const notInErrorCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isInError = notInErrorCertificationResult.isInError();

        // then
        expect(isInError).to.be.false;
      });
    });
  });

  context('#isStarted', function () {
    it('returns true if status is "started"', function () {
      // given
      const startedCertificationResult = domainBuilder.buildCertificationResult({
        status: CERTIFICATION_RESULT_STATUS_STARTED,
      });

      // when
      const isStarted = startedCertificationResult.isStarted();

      // then
      expect(isStarted).to.be.true;
    });

    [
      { statusName: 'cancelled', status: CERTIFICATION_RESULT_STATUS_CANCELLED },
      { statusName: 'validated', status: CERTIFICATION_RESULT_STATUS_VALIDATED },
      { statusName: 'rejected', status: CERTIFICATION_RESULT_STATUS_REJECTED },
      { statusName: 'error', status: CERTIFICATION_RESULT_STATUS_ERROR },
    ].forEach(function (testCase) {
      it(`should return false when status is ${testCase.statusName}`, async function () {
        // given
        const notStartedCertificationResult = domainBuilder.buildCertificationResult({
          status: testCase.status,
        });

        // when
        const isStarted = notStartedCertificationResult.isStarted();

        // then
        expect(isStarted).to.be.false;
      });
    });
  });

  context('#getUniqComplementaryCertificationCourseResultLabels', function () {
    it('should return an array of unique labels', function () {
      // given
      const complementaryCertificationCourseResults = [
        domainBuilder.buildComplementaryCertificationCourseResult({ label: 'CléA Numérique' }),
        domainBuilder.buildComplementaryCertificationCourseResult({ label: 'Pix+ Droit' }),
        domainBuilder.buildComplementaryCertificationCourseResult({ label: 'CléA Numérique' }),
        domainBuilder.buildComplementaryCertificationCourseResult({ label: 'Pix+ Edu 1er degré' }),
        domainBuilder.buildComplementaryCertificationCourseResult({ label: 'Pix+ Edu 2nd degré' }),
      ];
      const certificationResult = domainBuilder.buildCertificationResult({
        complementaryCertificationCourseResults,
      });

      const expectedComplementaryCertificationCourseLabels = [
        'CléA Numérique',
        'Pix+ Droit',
        'Pix+ Edu 1er degré',
        'Pix+ Edu 2nd degré',
      ];

      // when
      const result = certificationResult.getUniqComplementaryCertificationCourseResultLabels();

      // then
      expect(result).to.deep.equal(expectedComplementaryCertificationCourseLabels);
    });
  });

  context('#isCoreFramework', function () {
    it('return true if framework is CORE', function () {
      const certificationResult = new CertificationResult({
        framework: Frameworks.CORE,
      });
      expect(certificationResult.isCoreFramework()).to.be.true;
    });
    it('return false if framework is PIX PLUS DROIT', function () {
      const certificationResult = new CertificationResult({
        framework: Frameworks.DROIT,
      });
      expect(certificationResult.isCoreFramework()).to.be.false;
    });
  });
});
