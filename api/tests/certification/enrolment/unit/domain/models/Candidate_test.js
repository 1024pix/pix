import { Candidate } from '../../../../../../src/certification/enrolment/domain/models/Candidate.js';
import { SubscriptionTypes } from '../../../../../../src/certification/shared/domain/models/SubscriptionTypes.js';
import { CertificationCandidatesError } from '../../../../../../src/shared/domain/errors.js';
import { CertificationCandidate } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, catchErrSync, domainBuilder, expect } from '../../../../../test-helper.js';
import { getI18n } from '../../../../../tooling/i18n/i18n.js';

const i18n = getI18n();
const translate = i18n.__;

describe('Certification | Enrolment | Unit | Domain | Models | Candidate', function () {
  let candidateData;

  beforeEach(function () {
    candidateData = {
      id: 456,
      createdAt: new Date('2020-01-01'),
      firstName: 'Jean-Charles',
      lastName: 'Quiberon',
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
      billingMode: CertificationCandidate.BILLING_MODES.FREE,
      prepaymentCode: null,
      hasSeenCertificationInstructions: false,
      subscriptions: [
        {
          type: SubscriptionTypes.CORE,
          complementaryCertificationId: null,
          complementaryCertificationLabel: null,
          complementaryCertificationKey: null,
        },
      ],
    };
  });

  describe('updateBirthInformation', function () {
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

  describe('validate', function () {
    context('when all required fields are presents', function () {
      it('should not throw when object is valid', function () {
        // given
        const candidate = domainBuilder.certification.enrolment.buildCandidate(candidateData);

        // when, then
        candidate.validate();
      });
    });

    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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

    it('should throw an error when the subscriptions format is not valid', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        subscriptions: {},
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: '"subscriptions" must be an array',
        meta: {},
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when there are no subscription', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        subscriptions: [],
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: '"subscriptions" must contain at least 1 items',
        meta: [],
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when there subscription has not a valid type', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        subscriptions: [
          {
            type: 'Coucou Maman',
            complementaryCertificationId: null,
          },
        ],
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: '"subscriptions[0].type" must be one of [CORE, COMPLEMENTARY]',
        meta: 'Coucou Maman',
      });

      // when
      const error = await catchErr(candidate.validate, candidate)();

      // then
      expect(error).to.deepEqualInstanceOmitting(certificationCandidatesError, ['message', 'stack']);
    });

    it('should throw an error when subscription complementaryCertificationId is not defined when type is COMPLEMENTARY', async function () {
      // given
      const candidate = domainBuilder.certification.enrolment.buildCandidate({
        ...candidateData,
        subscriptions: [
          {
            type: SubscriptionTypes.COMPLEMENTARY,
            complementaryCertificationId: null,
          },
        ],
      });
      const certificationCandidatesError = new CertificationCandidatesError({
        code: '"subscriptions[0].complementaryCertificationId" must be a number',
        meta: null,
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
            candidate.validate(isSco);
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

      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      ['FREE', 'PAID', 'PREPAID'].forEach((billingMode) => {
        it(`should not throw if billing mode is an expected value ${billingMode}`, async function () {
          // given
          const candidate = domainBuilder.certification.enrolment.buildCandidate({
            ...candidateData,
            billingMode,
            prepaymentCode: billingMode === CertificationCandidate.BILLING_MODES.PREPAID ? '12345' : undefined,
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

  describe('parseBillingMode', function () {
    // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
    // eslint-disable-next-line mocha/no-setup-in-describe
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
});
