const { expect, domainBuilder, catchErr } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const {
  InvalidCertificationCandidate,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
} = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Certification Candidate', function() {

  describe('constructor', function() {

    it('should build a Certification Candidate from JSON', function() {
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

  describe('validate', function() {

    const buildCertificationCandidate = (attributes) => new CertificationCandidate(attributes);

    context('current version 1.4', function() {
      const version = '1.4';

      const validAttributes = {
        firstName: 'Oren',
        lastName: 'Ishii',
        birthCity: 'Torreilles',
        birthProvinceCode: '66',
        birthCountry: 'France',
        birthdate: '2010-01-01',
        sessionId: 123,
        resultRecipientEmail: 'orga@example.net',
      };

      context('when all required fields are presents', function() {
        it('should be ok when object is valid', function() {
          try {
            const certificationCandidate = buildCertificationCandidate(validAttributes);
            certificationCandidate.validate(version);
          } catch (e) {
            expect.fail('certificationCandidate is valid when all required fields are present');
          }
        });
      });

      [
        'firstName',
        'lastName',
        'birthCity',
        'birthProvinceCode',
        'birthCountry',
      ].forEach((field) => {
        it(`should throw an error when field ${field} is not a string`, async function() {
          const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: 123 });
          const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

          expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          expect(error.key).to.equal(field);
          expect(error.why).to.equal('not_a_string');
        });

        it(`should throw an error when field ${field} is not present`, async function() {
          const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: undefined });
          const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

          expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          expect(error.key).to.equal(field);
          expect(error.why).to.equal('required');
        });

        it(`should throw an error when field ${field} is not present because null`, async function() {
          const certificationCandidate = buildCertificationCandidate({ ...validAttributes, [field]: null });
          const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

          expect(error).to.be.instanceOf(InvalidCertificationCandidate);
          expect(error.key).to.equal(field);
          expect(error.why).to.equal('required');
        });
      });

      it('should throw an error when field sessionId is not a number', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: 'salut' });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('sessionId');
        expect(error.why).to.equal('not_a_number');
      });

      it('should throw an error when field sessionId is not present', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: undefined });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('sessionId');
        expect(error.why).to.equal('required');
      });

      it('should throw an error when field sessionId is not present because null', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, sessionId: null });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('sessionId');
        expect(error.why).to.equal('required');
      });

      it('should throw an error when field externalId is not a string', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, externalId: 1235 });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('externalId');
        expect(error.why).to.equal('not_a_string');
      });

      it('should throw an error when birthdate is not a date', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: 'je mange des légumes' });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('date_format');
      });

      it('should throw an error when birthdate is not a valid format', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: '2020/02/01' });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('date_format');
      });

      it('should throw an error when birthdate is null', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: null });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });

      it('should throw an error when birthdate is not present', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, birthdate: undefined });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('birthdate');
        expect(error.why).to.equal('required');
      });

      it('should throw an error when field extraTimePercentage is not a number', async function() {
        const certificationCandidate = buildCertificationCandidate({ ...validAttributes, extraTimePercentage: 'salut' });
        const error = await catchErr(certificationCandidate.validate, certificationCandidate)(version);

        expect(error).to.be.instanceOf(InvalidCertificationCandidate);
        expect(error.key).to.equal('extraTimePercentage');
        expect(error.why).to.equal('not_a_number');
      });
    });
  });

  describe('validateParticipation', function() {

    it('should not throw when the object is valid', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();

      // when
      certificationCandidate.validateParticipation();

      // then
      expect(true).to.be.true;
    });

    it('should return an error if firstName is not defined', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.firstName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if firstName is not a string', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if lastName is not defined', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.lastName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if lastName is not a string', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate is not defined', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.birthdate = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if birthdate is not a date in iso format', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate not greater than 1900-01-01', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if birthdate does not exist (such as 31th November)', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

    it('should return an error if sessionId is not defined', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.sessionId = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoFieldMissingError);
      }
    });

    it('should return an error if sessionId is not a number', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(CertificationCandidatePersonalInfoWrongFormat);
      }
    });

  });

});
