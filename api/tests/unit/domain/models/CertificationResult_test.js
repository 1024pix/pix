import CertificationResult from '../../../../lib/domain/models/CertificationResult';
import { expect, domainBuilder } from '../../../test-helper';

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
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        emitter: CertificationResult.emitters.PIX_ALGO,
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
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
        assessmentResultStatus: CertificationResult.status.VALIDATED,
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
        isV2Certification: true,
        externalId: 'VAMPIRES_SUCK',
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-01-02'),
        hasSeenEndTestScreen: true,
        sessionId: 456,
        assessmentId: 789,
        resultCreatedAt: new Date('2020-01-03'),
        pixScore: 123,
        status: CertificationResult.status.VALIDATED,
        emitter: CertificationResult.emitters.PIX_ALGO,
        commentForCandidate: 'Un commentaire candidat 1',
        commentForJury: 'Un commentaire jury 1',
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
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        {
          statusName: 'cancelled',
          isCancelled: true,
          // eslint-disable-next-line mocha/no-setup-in-describe
          assessmentResultStatus: CertificationResult.status.VALIDATED,
          validationFunction: 'isCancelled',
        },
        {
          statusName: 'validated',
          isCancelled: false,
          // eslint-disable-next-line mocha/no-setup-in-describe
          assessmentResultStatus: CertificationResult.status.VALIDATED,
          validationFunction: 'isValidated',
        },
        {
          statusName: 'rejected',
          isCancelled: false,
          // eslint-disable-next-line mocha/no-setup-in-describe
          assessmentResultStatus: CertificationResult.status.REJECTED,
          validationFunction: 'isRejected',
        },
        {
          statusName: 'error',
          isCancelled: false,
          // eslint-disable-next-line mocha/no-setup-in-describe
          assessmentResultStatus: CertificationResult.status.ERROR,
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
        status: CertificationResult.status.CANCELLED,
      });

      // when / then
      expect(cancelledCertificationResult.isCancelled()).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
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
        status: CertificationResult.status.VALIDATED,
      });

      // when
      const isValidated = validatedCertificationResult.isValidated();

      // then
      expect(isValidated).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
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
        status: CertificationResult.status.REJECTED,
      });

      // when
      const isRejected = rejectedCertificationResult.isRejected();

      // then
      expect(isRejected).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
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
        status: CertificationResult.status.ERROR,
      });

      // when
      const isInError = errorCertificationResult.isInError();

      // then
      expect(isInError).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'started', status: CertificationResult.status.STARTED },
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
        status: CertificationResult.status.STARTED,
      });

      // when
      const isStarted = startedCertificationResult.isStarted();

      // then
      expect(isStarted).to.be.true;
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'cancelled', status: CertificationResult.status.CANCELLED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'validated', status: CertificationResult.status.VALIDATED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'rejected', status: CertificationResult.status.REJECTED },
      // eslint-disable-next-line mocha/no-setup-in-describe
      { statusName: 'error', status: CertificationResult.status.ERROR },
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
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.REJECTED,
        expectedResult: true,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO_AUTO_JURY,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.REJECTED,
        expectedResult: true,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.REJECTED,
        expectedResult: false,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.STARTED,
        expectedResult: false,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO_AUTO_JURY,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.STARTED,
        expectedResult: false,
      },
      {
        // eslint-disable-next-line mocha/no-setup-in-describe
        emitter: CertificationResult.emitters.PIX_ALGO_NEUTRALIZATION,
        // eslint-disable-next-line mocha/no-setup-in-describe
        status: CertificationResult.status.STARTED,
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

  context('#getUniqComplementaryCertificationCourseResultHeaders', function () {
    it('should return an array of unique headers', function () {
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
        'Certification CléA Numérique',
        'Certification Pix+ Droit',
        'Certification Pix+ Edu 1er degré',
        'Certification Pix+ Edu 2nd degré',
      ];

      // when
      const result = certificationResult.getUniqComplementaryCertificationCourseResultHeaders();

      // then
      expect(result).to.deep.equal(expectedComplementaryCertificationCourseLabels);
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

  context('#getComplementaryCertificationStatus', function () {
    context('when complementary certification is acquired', function () {
      it('should return "Validée"', function () {
        // given
        const label = 'default label';
        const complementaryResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: true,
              label,
            }),
          ],
        });

        // when
        const result = complementaryResult.getComplementaryCertificationStatus(label);

        // then
        expect(result).to.deep.equal('Validée');
      });
    });

    context('when complementary certification is not acquired', function () {
      it('should return "Rejetée"', function () {
        // given
        const label = 'default label';
        const complementaryResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [
            domainBuilder.buildComplementaryCertificationCourseResult({
              acquired: false,
              label,
            }),
          ],
        });

        // when
        const result = complementaryResult.getComplementaryCertificationStatus(label);

        // then
        expect(result).to.deep.equal('Rejetée');
      });
    });

    context('when complementary certification is not taken', function () {
      it('should return "Non passée"', function () {
        // given
        const label = 'default label';
        const complementaryResult = domainBuilder.buildCertificationResult({
          complementaryCertificationCourseResults: [],
        });

        // when
        const result = complementaryResult.getComplementaryCertificationStatus(label);

        // then
        expect(result).to.deep.equal('Non passée');
      });
    });

    context('when certification result is cancelled', function () {
      it('should return "Annulée"', function () {
        // given
        const label = 'default label';
        const complementaryResult = domainBuilder.buildCertificationResult({
          status: CertificationResult.status.CANCELLED,
        });

        // when
        const result = complementaryResult.getComplementaryCertificationStatus(label);

        // then
        expect(result).to.deep.equal('Annulée');
      });
    });
  });
});
