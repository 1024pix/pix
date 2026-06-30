import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { BILLING_MODES } from '../../../../../../src/certification/shared/domain/constants.js';
import { CERTIFICATION_CANDIDATES_ERRORS } from '../../../../../../src/certification/shared/domain/constants/certification-candidates-errors.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { CertificationCandidatesError } from '../../../../../../src/shared/domain/errors.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr, catchErrSync } from '../../../../../tooling/test-utils/error.js';

const FIRST_NAME_ERROR_CODE = CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_FIRST_NAME_REQUIRED.code;
const LAST_NAME_ERROR_CODE = CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_LAST_NAME_REQUIRED.code;
const BIRTHDATE_ERROR_CODE = CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTHDATE_REQUIRED.code;
const SEX_ERROR_CODE = CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SEX_REQUIRED.code;
const i18n = getI18n();
const translate = i18n.__;

describe('Certification | Enrolment | Unit | Domain | Models | Candidate', function () {
  let candidateData;

  beforeEach(function () {
    candidateData = {
      id: 456,
      createdAt: new Date('2020-01-01'),
      firstName: 'Jean-Charles',
      lastName: 'Quiberons',
      sex: 'M',
      birthPostalCode: 'Code postal',
      birthINSEECode: 'Insee code',
      birthCity: 'Ma ville',
      birthProvinceCode: 'Mon département',
      birthCountry: 'Mon pays',
      email: 'jc.quiberon@example.net',
      resultRecipientEmail: 'ma_maman@example.net',
      birthdate: '1990-05-06',
      extraTimePercentage: 0.3,
      externalId: 'JCQUIB',
      userId: 777,
      sessionId: 888,
      organizationLearnerId: 999,
      authorizedToStart: false,
      complementaryCertificationId: null,
      billingMode: BILLING_MODES.FREE,
      prepaymentCode: null,
      hasSeenCertificationInstructions: false,
    };
  });

  context('updateBirthInformation', function () {
    it("should update candidate's birth information", function () {
      // given
      const birthCountry = 'updatedBirthCountry';
      const birthINSEECode = 'updatedBirthINSEECode';
      const birthPostalCode = 'updatedBirthPostalCode';
      const birthCity = 'updatedBirthCity';

      const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);

      // when
      candidate.updateBirthInformation({ birthCountry, birthINSEECode, birthPostalCode, birthCity });

      // then
      const expectedCandidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthCountry: 'updatedBirthCountry',
        birthINSEECode: 'updatedBirthINSEECode',
        birthPostalCode: 'updatedBirthPostalCode',
        birthCity: 'updatedBirthCity',
      });
      expect(expectedCandidate).to.deepEqualInstance(candidate);
    });
  });

  context('reconcile', function () {
    it('should link candidate to a user', function () {
      // given
      const userId = 123;
      const candidate = domainBuilder.certification.enrolment.buildCandidate();

      // when
      candidate.reconcile(userId);

      // then
      expect(candidate.userId).to.equal(userId);
      expect(candidate.reconciledAt).to.be.instanceOf(Date);
    });
  });

  context('validate', function () {
    context('when all required fields are presents', function () {
      it('should not throw when object is valid', function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);

        // when, then
        candidate.validate();
      });
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe

    [
      { name: 'firstName', code: 'CANDIDATE_FIRST_NAME_MUST_BE_A_STRING' },
      { name: 'lastName', code: 'CANDIDATE_LAST_NAME_MUST_BE_A_STRING' },
    ].forEach((field) => {
      it(`should throw an error when field ${field.name} is not a string`, async function () {
        // given
        const certificationCandidatesError = new CertificationCandidatesError({
          code: field.code,
          meta: 123,
        });

        // when
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          [field.name]: 123,
        });
        const error = catchErrSync(() => candidate.validate())();

        // then
        expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
      });

      [
        { name: 'firstName', code: 'CANDIDATE_FIRST_NAME_REQUIRED' },
        { name: 'lastName', code: 'CANDIDATE_LAST_NAME_REQUIRED' },
      ].forEach((field) => {
        it(`should throw an error when field ${field.name} is not present`, async function () {
          //given
          const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
          candidate[field.name] = undefined;
          const certificationCandidatesError = new CertificationCandidatesError({
            code: field.code,
          });

          // when
          const error = await catchErr(candidate.validate, candidate)();

          // then
          expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
        });

        it(`should throw an error when field ${field.name} contains only spaces`, async function () {
          //given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            [field.name]: ' ',
          });
          const certificationCandidatesError = new CertificationCandidatesError({
            code: field.code,
          });

          // when
          const error = await catchErr(candidate.validate, candidate)();

          // then
          expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
        });

        it(`should throw an error when field ${field.name} is not present because null`, async function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            [field.name]: null,
          });
          const certificationCandidatesError = new CertificationCandidatesError({
            code: field.code,
          });

          // when
          const error = await catchErr(candidate.validate, candidate)();

          // then
          expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
        });
      });
    });

    it('should throw an error when field sessionId is not a number', async function () {
      //given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        sessionId: 'salut',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_SESSION_ID_NOT_A_NUMBER',
        meta: 'salut',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when field sessionId is not present', async function () {
      //given
      const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
      candidate.sessionId = undefined;
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_SESSION_ID_REQUIRED',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when field sessionId is not present because null', async function () {
      //given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        sessionId: null,
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_SESSION_ID_REQUIRED',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when field externalId is not a string', async function () {
      //given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        externalId: 1235,
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_EXTERNAL_ID_MUST_BE_A_STRING',
        meta: 1235,
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when birthdate is not a date', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthdate: 'je mange des légumes',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID',
        meta: 'je mange des légumes',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when birthdate is not a valid format', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthdate: '2020/02/01',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID',
        meta: '2020/02/01',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when birthdate is null', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthdate: null,
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_BIRTHDATE_REQUIRED',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when birthdate is not present', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
      candidate.birthdate = undefined;
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_BIRTHDATE_REQUIRED',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when field extraTimePercentage is not a number', async function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        extraTimePercentage: 'salut',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_EXTRA_TIME_INTEGER',
        meta: NaN,
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when sex is neither M nor F', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        sex: 'salut',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_SEX_NOT_VALID',
        meta: 'salut',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should return a report when email is not a valid format', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        email: 'email@example.net, anotheremail@example.net',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_EMAIL_NOT_VALID',
        meta: 'email@example.net, anotheremail@example.net',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should return a report when resultRecipientEmail is not a valid format', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        resultRecipientEmail: 'email@example.net, anotheremail@example.net',
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: 'CANDIDATE_RESULT_RECIPIENT_EMAIL_NOT_VALID',
        meta: 'email@example.net, anotheremail@example.net',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    context('subscription validation', function () {
      context('success cases', function () {
        Object.values(Frameworks).forEach((subscription) => {
          it(`should validate when subscription is ${subscription}`, function () {
            const candidate = domainBuilder.certification.enrolment.buildCandidate({ ...candidateData, subscription });
            candidate.validate();
          });
        });
      });

      context('ko cases', function () {
        it('should not validate when subscription is an unknown value', async function () {
          const candidate = domainBuilder.certification.enrolment.buildCandidate({ ...candidateData });
          candidate.subscription = 'UNKNOWN_FRAMEWORK';
          const error = await catchErr(candidate.validate, candidate)();
          expect(error).to.be.instanceOf(CertificationCandidatesError);
        });
      });
    });

    context('when the certification center is SCO', function () {
      context('when the billing mode is null', function () {
        it('should not throw an error', async function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            billingMode: null,
          });
          const isSco = true;
          // when
          const call = () => {
            candidate.validate({ isSco });
          };

          // then
          expect(call).to.not.throw();
        });
      });
    });

    context('when the certification center is not SCO', function () {
      it('should throw an error if billingMode is null', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          billingMode: null,
        });

        const certificationCandidatesError = new CertificationCandidatesError({
          code: 'CANDIDATE_BILLING_MODE_REQUIRED',
          meta: null,
        });

        // when
        const error = await catchErr(candidate.validate, candidate)();

        // then
        expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
      });

      it('should throw an error if billingMode is not an expected value', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          billingMode: 'NOT_ALLOWED_VALUE',
        });
        const isSco = false;

        const certificationCandidatesError = new CertificationCandidatesError({
          code: 'CANDIDATE_BILLING_MODE_NOT_VALID',
          meta: 'NOT_ALLOWED_VALUE',
        });

        // when
        const error = await catchErr(candidate.validate, candidate)(isSco);

        // then
        expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
      });

      ['FREE', 'PAID', 'PREPAID'].forEach((billingMode) => {
        it(`should not throw if billing mode is an expected value ${billingMode}`, async function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            billingMode,
            prepaymentCode: billingMode === BILLING_MODES.PREPAID ? '12345' : undefined,
          });

          // when
          const call = () => {
            candidate.validate();
          };

          // then
          expect(call).to.not.throw();
        });
      });

      context('when billingMode is not PREPAID', function () {
        it('should throw an error if prepaymentCode is not null', async function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            billingMode: 'PAID',
            prepaymentCode: 'NOT_NULL',
          });

          const certificationCandidatesError = new CertificationCandidatesError({
            code: 'CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY',
            meta: 'NOT_NULL',
          });

          // when
          const error = await catchErr(candidate.validate, candidate)();

          // then
          expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
        });
      });

      context('when billingMode is PREPAID', function () {
        it('should not throw an error if prepaymentCode is not null', function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            billingMode: 'PREPAID',
            prepaymentCode: 'NOT_NULL',
          });

          // when
          const call = () => {
            candidate.validate();
          };

          // then
          expect(call).to.not.throw();
        });
      });
    });
  });

  context('validateForMassSessionImport', function () {
    context('when all required fields are presents', function () {
      it('should return nothing', function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);

        // when
        const report = candidate.validateForMassSessionImport();

        // then
        expect(report).to.be.undefined;
      });
    });

    [
      { field: 'firstName', expectedCode: FIRST_NAME_ERROR_CODE },
      { field: 'lastName', expectedCode: LAST_NAME_ERROR_CODE },
      { field: 'birthdate', expectedCode: BIRTHDATE_ERROR_CODE },
      {
        field: 'sex',
        expectedCode: SEX_ERROR_CODE,
      },
    ].forEach(({ field, expectedCode }) => {
      it(`should return a report when field ${field} is not present`, async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);
        delete candidate[field];

        // when
        const report = candidate.validateForMassSessionImport();

        // then
        expect(report).to.deep.equal([`${expectedCode}`]);
      });

      it(`should return a report when field ${field} is null`, async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          [field]: null,
        });

        // when
        const report = candidate.validateForMassSessionImport();

        // then
        expect(report).to.deep.equal([expectedCode]);
      });
    });

    it('should return a report when birthdate is not a valid format', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthdate: '2020/02/01',
      });

      // when
      const report = candidate.validateForMassSessionImport();

      // then
      expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BIRTHDATE_FORMAT_NOT_VALID.code]);
    });

    it('should return a report when birthdate is null', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        birthdate: null,
      });

      // when
      const report = candidate.validateForMassSessionImport();

      // then
      expect(report).to.deep.equal([BIRTHDATE_ERROR_CODE]);
    });

    context('when extraTimePercentage field is presents', function () {
      it('should return a report when field extraTimePercentage is not a number', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          extraTimePercentage: 'salut',
        });

        // when
        const report = candidate.validateForMassSessionImport();

        //then
        expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_INTEGER.code]);
      });

      it('should throw an error when field extraTimePercentage is greater than 10', async function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          extraTimePercentage: 11,
        });

        // when
        const report = candidate.validateForMassSessionImport();

        // then
        expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_EXTRA_TIME_OUT_OF_RANGE.code]);
      });
    });

    it('should return a report when sex is neither M nor F', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        sex: 'something_else',
      });

      // when
      const report = candidate.validateForMassSessionImport();

      // then
      expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_SEX_NOT_VALID.code]);
    });

    it('should return a report when sex is null', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        sex: null,
      });

      // when
      const report = candidate.validateForMassSessionImport();

      // then
      expect(report).to.deep.equal([SEX_ERROR_CODE]);
    });

    context('when billing mode field is presents', function () {
      context('when the certification center is SCO', function () {
        context('when the billing mode is null', function () {
          it('should return nothing', async function () {
            // given
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: null,
            });
            const isSco = true;

            // when
            const report = candidate.validateForMassSessionImport(isSco);

            // then
            expect(report).to.be.undefined;
          });
        });

        context('when the billing mode is not null', function () {
          it('should return a report', async function () {
            // given
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: 'FREE',
            });
            const isSco = true;

            // when
            const report = candidate.validateForMassSessionImport(isSco);

            // then
            expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_MUST_BE_EMPTY.code]);
          });
        });
      });

      context('when the certification center is not SCO', function () {
        context('when the billing mode is not provided', function () {
          it('should return a report', async function () {
            // given
            const isSco = false;
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: null,
            });

            // when
            const report = candidate.validateForMassSessionImport(isSco);

            // then
            expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_REQUIRED.code]);
          });
        });

        context('when the billing mode is not an expected value', function () {
          it('should return a report', async function () {
            // given
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: 'NOT_ALLOWED_VALUE',
            });
            const isSco = false;

            // when
            const report = candidate.validateForMassSessionImport(isSco);

            // then
            expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_BILLING_MODE_NOT_VALID.code]);
          });
        });

        context('when billing mode is in the expected values', function () {
          ['FREE', 'PAID', 'PREPAID'].forEach((billingMode) => {
            it(`should return nothing for ${billingMode}`, async function () {
              // given
              const candidate = domainBuilder.certification.enrolment.buildCandidate({
                ...candidateData,
                billingMode,
              });
              candidate.prepaymentCode = billingMode === BILLING_MODES.PREPAID ? '12345' : undefined;

              // when
              const report = candidate.validateForMassSessionImport();

              // then
              expect(report).to.be.undefined;
            });
          });
        });

        context('when billingMode is not PREPAID', function () {
          context('when prepaymentCode is not null', function () {
            it('should return a report', async function () {
              // given
              const candidate = domainBuilder.certification.enrolment.buildCandidate({
                ...candidateData,
                billingMode: 'PAID',
                prepaymentCode: 'NOT_NULL',
              });

              // when
              const report = candidate.validateForMassSessionImport();

              // then
              expect(report).to.deep.equal([
                CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_PREPAYMENT_CODE_MUST_BE_EMPTY.code,
              ]);
            });
          });
        });

        context('when billingMode is PREPAID', function () {
          it('should return nothing if prepaymentCode is not null', function () {
            // given
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: 'PREPAID',
              prepaymentCode: 'NOT_NULL',
            });

            // when
            const report = candidate.validateForMassSessionImport();

            // then
            expect(report).to.be.undefined;
          });

          it('should return report if prepaymentCode is null', function () {
            // given
            const candidate = domainBuilder.certification.enrolment.buildCandidate({
              ...candidateData,
              billingMode: 'PREPAID',
              prepaymentCode: '',
            });

            // when
            const report = candidate.validateForMassSessionImport();

            // then
            expect(report).to.deep.equal([CERTIFICATION_CANDIDATES_ERRORS.CANDIDATE_PREPAYMENT_CODE_REQUIRED.code]);
          });
        });
      });
    });

    context('when there are multiple errors', function () {
      it('should return multiple message', function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate({
          ...candidateData,
          billingMode: 'FREE',
        });
        delete candidate.firstName;
        delete candidate.birthdate;

        // when
        const report = candidate.validateForMassSessionImport();

        // then
        expect(report).to.deep.equal([FIRST_NAME_ERROR_CODE, BIRTHDATE_ERROR_CODE]);
      });
    });
  });

  context('parseBillingMode', function () {
    [
      { value: 'Gratuite', expectedTranslation: 'FREE' },
      { value: 'Payante', expectedTranslation: 'PAID' },
      { value: 'Prépayée', expectedTranslation: 'PREPAID' },
    ].forEach(({ value, expectedTranslation }) => {
      it(`should return ${expectedTranslation} when ${value} is translated`, function () {
        expect(Candidate.parseBillingMode({ billingMode: value, translate })).to.equal(expectedTranslation);
      });
    });
  });

  context('isReconciled', function () {
    it('should return false when candidate is not reconciled', function () {
      // given
      const notReconciledCandidates = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          reconciledAt: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 123,
          reconciledAt: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          reconciledAt: new Date(),
        }),
      ];

      notReconciledCandidates.forEach((candidate) => {
        // when
        const isReconciled = candidate.isReconciled();
        // then
        expect(isReconciled).to.be.false;
      });
    });

    it('should return true when candidate is reconciled', function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId: 123,
        reconciledAt: new Date(),
      });

      // when
      const isReconciled = candidate.isReconciled();

      // then
      expect(isReconciled).to.be.true;
    });
  });

  context('isReconciledTo', function () {
    it('should return true when candidate is reconciled to given userId', function () {
      // given
      const userId = 123;
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId,
        reconciledAt: new Date(),
      });

      // when
      const isReconciledTo = candidate.isReconciledTo(userId);

      // then
      expect(isReconciledTo).to.be.true;
    });

    it('should return false when candidate is not linked to given userId', function () {
      // given
      const userId = 123;
      const notReconciledToUser123 = [
        domainBuilder.certification.enrolment.buildCandidate({
          userId: 456,
          reconciledAt: new Date(),
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId,
          reconciledAt: null,
        }),
        domainBuilder.certification.enrolment.buildCandidate({
          userId: null,
          reconciledAt: new Date(),
        }),
      ];

      notReconciledToUser123.forEach((candidate) => {
        // when
        const isReconciledTo = candidate.isReconciledTo(userId);
        // then
        expect(isReconciledTo).to.be.false;
      });
    });

    it('should return false when candidate is not reconciled to anyone', function () {
      // given
      const userId = 123;
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        userId: null,
      });

      // when
      const isReconciledTo = candidate.isReconciledTo(userId);

      // then
      expect(isReconciledTo).to.be.false;
    });
  });

  describe('convertExtraTimePercentageToDecimal', function () {
    it('should convert extraTimePercentageToDecimal integer to decimal', function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        extraTimePercentage: 20,
      });

      // when
      candidate.convertExtraTimePercentageToDecimal();

      // when / then
      expect(candidate.extraTimePercentage).to.equal(0.2);
    });
  });

  describe('hasCoreFrameworkSubscription', function () {
    it('should return false when subscription is not CORE', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CLEA });
      expect(candidate.hasCoreFrameworkSubscription()).to.be.false;
    });

    it('should return true when subscription is CORE', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CORE });
      expect(candidate.hasCoreFrameworkSubscription()).to.be.true;
    });
  });

  describe('hasCoreScopeSubscription', function () {
    it('should return false when subscription is not CORE or CLEA', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.DROIT });
      expect(candidate.hasCoreScopeSubscription()).to.be.false;
    });

    it('should return true when subscription is CORE', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CORE });
      expect(candidate.hasCoreScopeSubscription()).to.be.true;
    });
    it('should return true when subscription is CLEA', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CLEA });
      expect(candidate.hasCoreScopeSubscription()).to.be.true;
    });
  });

  describe('#isRegisteredToDoubleCertification', function () {
    it('returns true when candidate subscription is CLEA', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.CLEA });
      expect(candidate.isRegisteredToDoubleCertification()).to.be.true;
    });

    it('returns false when candidate subscription is not CLEA', function () {
      const candidate = domainBuilder.certification.enrolment.buildCandidate({ subscription: Frameworks.DROIT });
      expect(candidate.isRegisteredToDoubleCertification()).to.be.false;
    });
  });

  describe('#static sortByLastNameAndFirstName', function () {
    it('sorts candidates alphabetically by last name then first name', function () {
      const michelJacques = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Michel',
        lastName: 'Jacques',
      });
      const jeannetteJacques = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Jeanette',
        lastName: 'Jacques',
      });
      const fredericMercure = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Frédéric',
        lastName: 'Mercure',
      });
      const francoisMercure = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'François',
        lastName: 'Mercure',
      });
      const fridaMercure = domainBuilder.certification.enrolment.buildCandidate({
        firstName: 'Frida',
        lastName: 'Mercure',
      });

      const sortedCandidates = [michelJacques, jeannetteJacques, fredericMercure, francoisMercure, fridaMercure].sort(
        Candidate.sortByLastNameAndFirstName,
      );

      expect(sortedCandidates).to.deepEqualArray([
        jeannetteJacques,
        michelJacques,
        francoisMercure,
        fredericMercure,
        fridaMercure,
      ]);
    });
  });
});
