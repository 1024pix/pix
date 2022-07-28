const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { PIX_PLUS_DROIT, CLEA } = require('../../../../lib/domain/models/ComplementaryCertification');
const {
  InvalidCertificationCandidate,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Certification Candidate', function () {
  describe('constructor', function () {
    it('should build a Certification Candidate from JSON', function () {
      // given
      const rawData = {
        firstName: 'Jean-Pierre',
        lastName: 'Foucault',
        birthCity: 'Marseille',
        birthProvinceCode: '13',
        birthCountry: 'France',
        externalId: 'QVGDM',
        email: 'jp@fou.cau',
        birthdate: '1940-05-05',
        extraTimePercentage: 0.3,
        sessionId: 1,
        userId: 2,
      };

      // when
      const certificationCandidate = new CertificationCandidate(rawData);

      // then
      expect(certificationCandidate.firstName).to.equal('Jean-Pierre');
      expect(certificationCandidate.lastName).to.equal('Foucault');
      expect(certificationCandidate.birthCity).to.equal('Marseille');
      expect(certificationCandidate.birthProvinceCode).to.equal('13');
      expect(certificationCandidate.birthCountry).to.equal('France');
      expect(certificationCandidate.email).to.equal('jp@fou.cau');
      expect(certificationCandidate.externalId).to.equal('QVGDM');
      expect(certificationCandidate.birthdate).to.equal('1940-05-05');
      expect(certificationCandidate.extraTimePercentage).to.equal(0.3);
      expect(certificationCandidate.sessionId).to.equal(1);
      expect(certificationCandidate.userId).to.equal(2);
    });
  });

  describe('validate', function () {
    const buildCertificationCandidate = (attributes) => new CertificationCandidate(attributes);

    const validAttributes = {
      firstName: 'Oren',
      lastName: 'Ishii',
      sex: 'F',
      birthPostalCode: '75001',
      birthCountry: 'France',
      birthdate: '2010-01-01',
      sessionId: 123,
      resultRecipientEmail: 'orga@example.net',
      billingMode: 'FREE',
    };

    context('when all required fields are presents', function () {
      it('should be ok when object is valid', function () {
        try {
          const certificationCandidate = buildCertificationCandidate(validAttributes);
          certificationCandidate.validate();
        } catch (e) {
          expect.fail('certificationCandidate is valid when all required fields are present');
        }
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['firstName', 'lastName', 'birthCountry'].forEach((field) => {
      it(`should throw an error when field ${field} is not a string`, async function () {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: 123 });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('not_a_string');
      });

      it(`should throw an error when field ${field} is not present`, async function () {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: undefined });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });

      it(`should throw an error when field ${field} is not present because null`, async function () {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: null });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal(field);
        expect(error.why).to.equal('required');
      });
    });

    it('should throw an error when field sessionId is not a number', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: 'salut' });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('sessionId');
      expect(error.why).to.equal('not_a_number');
    });

    it('should throw an error when field sessionId is not present', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: undefined });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('sessionId');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when field sessionId is not present because null', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: null });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('sessionId');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when field externalId is not a string', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, externalId: 1235 });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('externalId');
      expect(error.why).to.equal('not_a_string');
    });

    it('should throw an error when birthdate is not a date', async function () {
      const certificationCandidate = buildCertificationCandidate({
        ...validAttributes,
        birthdate: 'je mange des légumes',
      });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is not a valid format', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: '2020/02/01' });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('date_format');
    });

    it('should throw an error when birthdate is null', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: null });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when birthdate is not present', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: undefined });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('birthdate');
      expect(error.why).to.equal('required');
    });

    it('should throw an error when field extraTimePercentage is not a number', async function () {
      const certificationCandidate = buildCertificationCandidate({
        ...validAttributes,
        extraTimePercentage: 'salut',
      });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('extraTimePercentage');
      expect(error.why).to.equal('not_a_number');
    });

    it('should throw an error when sex is neither M nor F', async function () {
      const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sex: 'something_else' });
      const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

      expect(error).to.be.instanceOf(InvalidCertificationCandidate);
      expect(error.key).to.equal('sex');
      expect(error.why).to.equal('not_a_sex_code');
    });

    context('when the certification center is SCO', function () {
      context('when the billing mode is null', function () {
        it('should not throw an error', async function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            billingMode: null,
          });
          const isSco = true;

          // when
          const call = () => {
            certificationCandidate.validate(isSco);
          };

          // then
          expect(call).to.not.throw();
        });
      });
    });
    context('when the certification center is not SCO', function () {
      it('should throw an error if billingMode is null', async function () {
        // given
        const isSco = false;
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          billingMode: null,
        });

        // when
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(isSco);

        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('billingMode');
        expect(error.why).to.equal('required');
      });

      it('should throw an error if billingMode is not an expected value', async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          billingMode: 'NOT_ALLOWED_VALUE',
        });
        const isSco = false;

        // when
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(isSco);

        // then
        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('billingMode');
        expect(error.why).to.equal('not_a_billing_mode');
      });

      // eslint-disable-next-line mocha/no-setup-in-describe
      ['FREE', 'PAID', 'PREPAID'].forEach((billingMode) => {
        it(`should not throw if billing mode is an expected value ${billingMode}`, async function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            billingMode,
            prepaymentCode: billingMode === CertificationCandidate.BILLING_MODES.PREPAID ? '12345' : undefined,
          });

          // when
          const call = () => {
            certificationCandidate.validate();
          };

          // then
          expect(call).to.not.throw();
        });
      });

      context('when billingMode is not PREPAID', function () {
        it('should throw an error if prepaymentCode is not null', async function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            billingMode: 'PAID',
            prepaymentCode: 'NOT_NULL',
          });

          // when
          const error = await catchErr(certificationCandidate.validate, certificationCandidate)();

          // then
          expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          expect(error.key).to.equal('prepaymentCode');
          expect(error.why).to.equal('prepayment_code_not_null');
        });
      });

      context('when billingMode is PREPAID', function () {
        it('should not throw an error if prepaymentCode is not null', function () {
          // given
          const certificationCandidate = domainBuilder.buildCertificationCandidate({
            billingMode: 'PREPAID',
            prepaymentCode: 'NOT_NULL',
          });

          // when
          const call = () => {
            certificationCandidate.validate();
          };

          // then
          expect(call).to.not.throw();
        });
      });
    });
  });

  describe('validateParticipation', function () {
    it('should not throw when the object is valid', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();

      // when
      certificationCandidate.validateParticipation();

      // then
      expect(true).to.be.true;
    });

    it('should return an error if firstName is not defined', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.firstName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if firstName is not a string', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if lastName is not defined', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.lastName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if lastName is not a string', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate is not defined', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.birthdate = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if birthdate is not a date in iso format', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate not greater than 1900-01-01', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate does not exist (such as 31th November)', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if sessionId is not defined', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.sessionId = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if sessionId is not a number', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['FREE', 'PAID', 'PREPAID'].forEach((billingMode) => {
      it(`should not throw if billing mode is expected value ${billingMode}`, async function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          billingMode,
          prepaymentCode: billingMode === CertificationCandidate.BILLING_MODES.PREPAID ? '12345' : undefined,
        });

        // when
        const call = () => {
          certificationCandidate.validateParticipation();
        };

        // then
        expect(call).to.not.throw();
      });
    });

    it('should throw an error when billing mode is none of the expected values', async function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ billingMode: 'Cadeau !' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should throw an error if billing mode is "Prépayée" but prepaymentCode is empty', async function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ billingMode: 'PREPAID' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) {
        // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });
  });

  describe('updateBirthInformation', function () {
    it("should update certification candidate's birth information", function () {
      // given
      const birthCountry = 'birthCountry';
      const birthINSEECode = 'birthINSEECode';
      const birthPostalCode = 'birthPostalCode';
      const birthCity = 'birthCity';

      const certificationCandidate = domainBuilder.buildCertificationCandidate();

      // when
      certificationCandidate.updateBirthInformation({ birthCountry, birthINSEECode, birthPostalCode, birthCity });

      // then
      expect(certificationCandidate.birthCountry).to.equal(birthCountry);
      expect(certificationCandidate.birthINSEECode).to.equal(birthINSEECode);
      expect(certificationCandidate.birthPostalCode).to.equal(birthPostalCode);
      expect(certificationCandidate.birthCity).to.equal(birthCity);
    });
  });

  describe('isAuthorizedToStart', function () {
    it('should return false when authorizedToStart is false', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ authorizedToStart: false });

      // then
      expect(certificationCandidate.isAuthorizedToStart()).to.be.false;
    });

    it('should return true when authorizedToStart is true', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ authorizedToStart: true });

      // then
      expect(certificationCandidate.isAuthorizedToStart()).to.be.true;
    });
  });

  describe('isBillingModePrepaid', function () {
    it('should return false when billingMode is not prepaid', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        billingMode: CertificationCandidate.BILLING_MODES.FREE,
      });

      // then
      expect(certificationCandidate.isBillingModePrepaid()).to.be.false;
    });

    it('should return true when billingMode is prepaid', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        billingMode: CertificationCandidate.BILLING_MODES.PREPAID,
      });

      // then
      expect(certificationCandidate.isBillingModePrepaid()).to.be.true;
    });
  });

  describe('translateBillingMode', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { value: 'FREE', expectedTranslation: 'Gratuite' },
      { value: 'PAID', expectedTranslation: 'Payante' },
      { value: 'PREPAID', expectedTranslation: 'Prépayée' },
      { value: 'Gratuite', expectedTranslation: 'FREE' },
      { value: 'Payante', expectedTranslation: 'PAID' },
      { value: 'Prépayée', expectedTranslation: 'PREPAID' },
    ].forEach(({ value, expectedTranslation }) => {
      it(`should return ${expectedTranslation} when ${value} is translated`, function () {
        expect(CertificationCandidate.translateBillingMode(value)).to.equal(expectedTranslation);
      });
    });
  });

  describe('get translatedBillingMode', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      { value: 'FREE', expectedTranslation: 'Gratuite' },
      { value: 'PAID', expectedTranslation: 'Payante' },
      { value: 'PREPAID', expectedTranslation: 'Prépayée' },
      { value: 'Gratuite', expectedTranslation: 'FREE' },
      { value: 'Payante', expectedTranslation: 'PAID' },
      { value: 'Prépayée', expectedTranslation: 'PREPAID' },
    ].forEach(({ value, expectedTranslation }) => {
      it(`should return ${expectedTranslation} when ${value} is translated`, function () {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({
          billingMode: value,
        });

        // when/then
        expect(certificationCandidate.translatedBillingMode).to.equal(expectedTranslation);
      });
    });
  });

  describe('isGrantedPixPlusDroit', function () {
    it('should return true when certification candidate has acquired PIX+ Droit complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        complementaryCertifications: [domainBuilder.buildComplementaryCertification({ name: PIX_PLUS_DROIT })],
      });

      // then
      expect(certificationCandidate.isGrantedPixPlusDroit()).to.be.true;
    });

    it('should return false when certification candidate has not acquired PIX+ Droit complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        complementaryCertifications: [domainBuilder.buildComplementaryCertification({ name: 'toto' })],
      });

      // then
      expect(certificationCandidate.isGrantedPixPlusDroit()).to.be.false;
    });
  });

  describe('isGrantedCleA', function () {
    it('should return true when certification candidate has acquired CleA complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        complementaryCertifications: [domainBuilder.buildComplementaryCertification({ name: CLEA })],
      });

      // then
      expect(certificationCandidate.isGrantedCleA()).to.be.true;
    });

    it('should return false when certification candidate has not acquired CleA complementary certification', function () {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({
        complementaryCertifications: [domainBuilder.buildComplementaryCertification({ name: 'toto' })],
      });

      // then
      expect(certificationCandidate.isGrantedCleA()).to.be.false;
    });
  });
});
