const { expect, domainBuilder } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { InvalidCertificationCandidate } = require('../../../../lib/domain/errors');
const { ValidationError } = require('@hapi/joi');

describe('Unit | Domain | Models | Certification Candidate', () => {

  describe('constructor', () => {

    it('should build a Certification Candidate from JSON', () => {
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

  describe('validate', () => {

    context('current version 1.3 (same as 1.2 version)', () => {

      it('should not throw when the object is valid', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();

        // when
        certificationCandidate.validate();

        // then
        expect(true).to.be.true;
      });

      it('should return an error if id is not a number nor undefined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ id: 'salut' });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.firstName = undefined;

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.lastName = undefined;

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCity = undefined;

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCity: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthProvinceCode = undefined;

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthProvinceCode: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCountry = undefined;

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCountry: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if email is not an email type of string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ email: 'Je mange des saucisses' });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if externalId is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ externalId: 123 });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if extraTimePercentage is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ extraTimePercentage: 'aaa' });

        // when
        try {
          certificationCandidate.validate();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthdate = undefined;

        // when
        return expect(() => certificationCandidate.validate())
          .to.throw(InvalidCertificationCandidate);
      });

      it('should return an error if birthdate is not a date in iso format', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

        // when
        return expect(() => certificationCandidate.validate())
          .to.throw(InvalidCertificationCandidate);
      });

      it('should return an error if birthdate not greater than 1900-01-01', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

        // when
        return expect(() => certificationCandidate.validate())
          .to.throw(InvalidCertificationCandidate);
      });

      it('should return an error if birthdate does not exist (such as 31th November)', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

        // when
        return expect(() => certificationCandidate.validate())
          .to.throw(InvalidCertificationCandidate);
      });

      it('should return an error if sessionId is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

        // then
        return expect(() => certificationCandidate.validate())
          .to.throw(InvalidCertificationCandidate);
      });

    });

    context('old version 1.2', () => {

      const version = '1.2';

      it('should not throw when the object is valid', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();

        // when
        certificationCandidate.validate(version);

        // then
        expect(true).to.be.true;
      });

      it('should return an error if id is not a number nor undefined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ id: 'salut' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.firstName = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.lastName = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCity = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCity: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthProvinceCode = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthProvinceCode: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCountry = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCountry: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if externalId is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ externalId: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if extraTimePercentage is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ extraTimePercentage: 'aaa' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthdate = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate is not a date in iso format', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate not greater than 1900-01-01', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate does not exist (such as 31th November)', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if sessionId is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });
    });

    context('old version 1.1', () => {

      const version = '1.1';

      it('should not throw when the object is valid', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();

        // when
        certificationCandidate.validate(version);

        // then
        expect(true).to.be.true;
      });

      it('should return an error if id is not a number nor undefined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ id: 'salut' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.firstName = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if firstName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.lastName = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if lastName is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCity = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCity is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCity: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthProvinceCode = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthProvinceCode is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthProvinceCode: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthCountry = undefined;

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthCountry is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCountry: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if externalId is not a string', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ externalId: 123 });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if extraTimePercentage is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ extraTimePercentage: 'aaa' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });

      it('should return an error if birthdate is not defined', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate();
        certificationCandidate.birthdate = undefined;

        // when
        try {
          certificationCandidate.validateParticipation();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(ValidationError);
        }
      });

      it('should return an error if birthdate is not a date in iso format', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

        // when
        try {
          certificationCandidate.validateParticipation();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(ValidationError);
        }
      });

      it('should return an error if birthdate not greater than 1900-01-01', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

        // when
        try {
          certificationCandidate.validateParticipation();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(ValidationError);
        }
      });

      it('should return an error if birthdate does not exist (such as 31th November)', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

        // when
        try {
          certificationCandidate.validateParticipation();
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(ValidationError);
        }
      });

      it('should return an error if sessionId is not a number', () => {
        // given
        const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

        // when
        try {
          certificationCandidate.validate(version);
          expect.fail('Expected error to have been thrown');
        } catch (err) { // then
          expect(err).to.be.instanceOf(InvalidCertificationCandidate);
        }
      });
    });
  });

  describe('validateParticipation', () => {

    it('should not throw when the object is valid', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();

      // when
      certificationCandidate.validateParticipation();

      // then
      expect(true).to.be.true;
    });

    it('should return an error if firstName is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.firstName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if firstName is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if lastName is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.lastName = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if lastName is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if birthdate is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.birthdate = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if birthdate is not a date in iso format', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '04/01/1990' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if birthdate not greater than 1900-01-01', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1899-06-06' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if birthdate does not exist (such as 31th November)', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: '1999-11-31' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if sessionId is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.sessionId = undefined;

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

    it('should return an error if sessionId is not a number', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ sessionId: 'a' });

      // when
      try {
        certificationCandidate.validateParticipation();
        expect.fail('Expected error to have been thrown');
      } catch (err) { // then
        expect(err).to.be.instanceOf(ValidationError);
      }
    });

  });

});
