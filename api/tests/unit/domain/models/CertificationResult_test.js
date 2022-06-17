const CertificationResult = require('../../../../lib/domain/models/CertificationResult');
const { expect, domainBuilder } = require('../../../test-helper');
const {
  PIX_EMPLOI_CLEA_V1,
  PIX_EMPLOI_CLEA_V2,
  PIX_EMPLOI_CLEA_V3,
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

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

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { method: 'hasTakenClea', partnerKeys: [PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3] },
    { method: 'hasTakenPixPlusDroitMaitre', partnerKeys: [PIX_DROIT_MAITRE_CERTIF] },
    { method: 'hasTakenPixPlusDroitExpert', partnerKeys: [PIX_DROIT_EXPERT_CERTIF] },
    { method: 'hasTakenPixPlusEdu2ndDegreInitie', partnerKeys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE] },
    {
      method: 'hasTakenPixPlusEdu2ndDegreConfirme',
      partnerKeys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME],
    },
    { method: 'hasTakenPixPlusEdu2ndDegreAvance', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE] },
    { method: 'hasTakenPixPlusEdu2ndDegreExpert', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT] },
    { method: 'hasTakenPixPlusEdu1erDegreInitie', partnerKeys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE] },
    {
      method: 'hasTakenPixPlusEdu1erDegreConfirme',
      partnerKeys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME],
    },
    { method: 'hasTakenPixPlusEdu1erDegreAvance', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE] },
    { method: 'hasTakenPixPlusEdu1erDegreExpert', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT] },
  ].forEach(({ method, partnerKeys }) => {
    context(`#${method}`, function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      partnerKeys.forEach((partnerKey) => {
        it(`returns true when ${partnerKey} certification has been taken in the certification`, async function () {
          // given
          const certificationResult = domainBuilder.buildCertificationResult({
            complementaryCertificationCourseResults: [
              domainBuilder.buildComplementaryCertificationCourseResult({ partnerKey }),
            ],
          });

          // when
          const hasTaken = certificationResult[method]();

          // then
          expect(hasTaken).to.be.true;
        });

        it(`returns false when ${partnerKey} certification has not been taken in the certification`, async function () {
          // given
          const certificationResult = domainBuilder.buildCertificationResult({
            complementaryCertificationCourseResults: [],
          });

          // when
          const hasTaken = certificationResult[method]();

          // then
          expect(hasTaken).to.be.false;
        });
      });
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    { method: 'hasAcquiredClea', partnerKeys: [PIX_EMPLOI_CLEA_V1, PIX_EMPLOI_CLEA_V2, PIX_EMPLOI_CLEA_V3] },
    { method: 'hasAcquiredPixPlusDroitMaitre', partnerKeys: [PIX_DROIT_MAITRE_CERTIF] },
    { method: 'hasAcquiredPixPlusDroitExpert', partnerKeys: [PIX_DROIT_EXPERT_CERTIF] },
    { method: 'hasAcquiredPixPlusEdu2ndDegreInitie', partnerKeys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE] },
    {
      method: 'hasAcquiredPixPlusEdu2ndDegreConfirme',
      partnerKeys: [PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME],
    },
    { method: 'hasAcquiredPixPlusEdu2ndDegreAvance', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE] },
    { method: 'hasAcquiredPixPlusEdu2ndDegreExpert', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT] },
    { method: 'hasAcquiredPixPlusEdu1erDegreInitie', partnerKeys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE] },
    {
      method: 'hasAcquiredPixPlusEdu1erDegreConfirme',
      partnerKeys: [PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME, PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME],
    },
    { method: 'hasAcquiredPixPlusEdu1erDegreAvance', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE] },
    { method: 'hasAcquiredPixPlusEdu1erDegreExpert', partnerKeys: [PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT] },
  ].forEach(({ method, partnerKeys }) => {
    context(`#${method}`, function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      partnerKeys.forEach((partnerKey) => {
        it(`returns true when ${partnerKey} certification has been acquired`, async function () {
          // given
          const certificationResult = domainBuilder.buildCertificationResult({
            complementaryCertificationCourseResults: [
              domainBuilder.buildComplementaryCertificationCourseResult({ partnerKey, acquired: true }),
            ],
          });

          // when
          const hasAcquired = certificationResult[method]();

          // then
          expect(hasAcquired).to.be.true;
        });

        it(`returns false when ${partnerKey} certification has not been acquired`, async function () {
          // given
          const certificationResult = domainBuilder.buildCertificationResult({
            complementaryCertificationCourseResults: [
              domainBuilder.buildComplementaryCertificationCourseResult({ partnerKey, acquired: false }),
            ],
          });
          // when
          const hasAcquired = certificationResult[method]();

          // then
          expect(hasAcquired).to.be.false;
        });
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
});
