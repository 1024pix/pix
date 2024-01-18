import { CertificationResult } from '../../../../lib/domain/models/index.js';
import { expect, domainBuilder } from '../../../test-helper.js';

const CERTIFICATION_RESULT_STATUS_CANCELLED = CertificationResult.status.CANCELLED;
const CERTIFICATION_RESULT_STATUS_ERROR = CertificationResult.status.ERROR;
const CERTIFICATION_RESULT_STATUS_REJECTED = CertificationResult.status.REJECTED;
const CERTIFICATION_RESULT_STATUS_STARTED = CertificationResult.status.STARTED;
const CERTIFICATION_RESULT_STATUS_VALIDATED = CertificationResult.status.VALIDATED;
const CERTIFICATION_RESULT_EMITTER_PIXALGO = CertificationResult.emitters.PIX_ALGO;
const CERTIFICATION_RESULT_EMITTER_AUTOJURY = CertificationResult.emitters.PIX_ALGO_AUTO_JURY;
const CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION = CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION;

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
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        emitter: CERTIFICATION_RESULT_EMITTER_PIXALGO,
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
        isCancelled: false,
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
        version: 2,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        status: CERTIFICATION_RESULT_STATUS_VALIDATED,
        emitter: CERTIFICATION_RESULT_EMITTER_PIXALGO,
        commentForOrganization: 'Un commentaire orga 1',
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

    context('status', function () {
      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          statusName: 'cancelled',
          isCancelled: true,

          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_VALIDATED,
          validationFunction: 'isCancelled',
        },
        {
          statusName: 'validated',
          isCancelled: false,

          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_VALIDATED,
          validationFunction: 'isValidated',
        },
        {
          statusName: 'rejected',
          isCancelled: false,

          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_REJECTED,
          validationFunction: 'isRejected',
        },
        {
          statusName: 'error',
          isCancelled: false,

          assessmentResultStatus: CERTIFICATION_RESULT_STATUS_ERROR,
          validationFunction: 'isInError',
        },

        { statusName: 'started', isCancelled: false, assessmentResultStatus: null, validationFunction: 'isStarted' },
      ].forEach(function (testCase) {
        it(`should build a ${testCase.statusName} CertificationResult`, async function () {
          // given
          const certificationResultDTO = {
            ...certificationResultData,
            isCancelled: testCase.isCancelled,
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

  context('#hasBeenRejectedAutomatically', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        emitter: CERTIFICATION_RESULT_EMITTER_PIXALGO,
        status: CERTIFICATION_RESULT_STATUS_REJECTED,
        expectedResult: true,
      },
      {
        emitter: CERTIFICATION_RESULT_EMITTER_AUTOJURY,
        status: CERTIFICATION_RESULT_STATUS_REJECTED,
        expectedResult: true,
      },
      {
        emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,
        status: CERTIFICATION_RESULT_STATUS_REJECTED,
        expectedResult: false,
      },
      {
        emitter: CERTIFICATION_RESULT_EMITTER_PIXALGO,
        status: CERTIFICATION_RESULT_STATUS_STARTED,
        expectedResult: false,
      },
      {
        emitter: CERTIFICATION_RESULT_EMITTER_AUTOJURY,
        status: CERTIFICATION_RESULT_STATUS_STARTED,
        expectedResult: false,
      },
      {
        emitter: CERTIFICATION_RESULT_EMITTER_NEUTRALIZATION,

        status: CERTIFICATION_RESULT_STATUS_STARTED,
        expectedResult: false,
      },
    ].forEach(function ({ expectedResult, emitter, status }) {
      it(`should return ${expectedResult} when status is ${status} and emitter is ${emitter}`, async function () {
        // given
        const certificationResult = domainBuilder.buildCertificationResult({
          emitter,
          status,
        });

        // when
        const hasBeenRejectedAutomatically = certificationResult.hasBeenRejectedAutomatically();

        // then
        expect(hasBeenRejectedAutomatically).to.equal(expectedResult);
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
});
