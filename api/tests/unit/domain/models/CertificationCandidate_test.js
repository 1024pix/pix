const { expect, domainBuilder } = require('../../../test-helper');
const CertificationCandidate = require('../../../../lib/domain/models/CertificationCandidate');
const { InvalidCertificationCandidate } = require('../../../../lib/domain/errors');

describe('Unit | Domain | Models | Certification Candidate', () => {

  describe('constructor', () => {

    it('should build a Certification Candidate Mark from JSON', () => {
      // given
      const rawData = {
        firstName: 'Jean-Pierre',
        lastName: 'Foucault',
        birthCity: 'Marseille',
        birthProvinceCode: '13',
        birthCountry: 'France',
        externalId: 'QVGDM',
        birthdate: '1940-05-05',
        extraTimePercentage: 0.3,
        sessionId: 1,
      };

      // when
      const certificationCandidate = new CertificationCandidate(rawData);

      // then
      expect(certificationCandidate.firstName).to.equal('Jean-Pierre');
      expect(certificationCandidate.lastName).to.equal('Foucault');
      expect(certificationCandidate.birthCity).to.equal('Marseille');
      expect(certificationCandidate.birthProvinceCode).to.equal('13');
      expect(certificationCandidate.birthCountry).to.equal('France');
      expect(certificationCandidate.externalId).to.equal('QVGDM');
      expect(certificationCandidate.birthdate).to.equal('1940-05-05');
      expect(certificationCandidate.extraTimePercentage).to.equal(0.3);
      expect(certificationCandidate.sessionId).to.equal(1);
    });
  });

  describe('validate', () => {

    it('should not throw when the object is valid', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();

      // when/then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should return an error if id is not a number nor undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ id: 'salut' });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if firstName is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.firstName = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if firstName is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ firstName: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if lastName is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.lastName = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if lastName is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ lastName: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if birthCity is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.birthCity = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if birthCity is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCity: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should not throw an error if birthProvinceCode is null', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthProvinceCode: null });

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should not throw an error if birthProvinceCode is undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      certificationCandidate.birthProvinceCode = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should return an error if birthProvinceCode is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthProvinceCode: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should not throw an error if birthCountry is null', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCountry: null });

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should not throw an error if birthCountry is undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      certificationCandidate.birthCountry = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should return an error if birthCountry is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthCountry: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should not throw an error if externalId is null', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ externalId: null });

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should not throw an error if externalId is undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      certificationCandidate.externalId = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should return an error if externalId is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ externalId: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should not throw an error if extraTimePercentage is null', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ extraTimePercentage: null });

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should not throw an error if extraTimePercentage is undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      certificationCandidate.extraTimePercentage = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should return an error if extraTimePercentage is not a number', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ extraTimePercentage: 'aaa' });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if birthdate is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.birthdate = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if birthdate is not a string', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: 123 });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if birthdate is not of size 10 (to ensure YYY-MM-DD)', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ birthdate: 'salut' });

      // then
      return expect(() => certificationCandidate.validate())
        .to.throw(InvalidCertificationCandidate);
    });

    it('should return an error if sessionId is not defined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate();
      certificationCandidate.sessionId = undefined;

      // then
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

    it('should not throw an error if createdAt is null', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({ createdAt: null });

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

    it('should not throw an error if createdAt is undefined', () => {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      certificationCandidate.createdAt = undefined;

      // then
      return expect(() => certificationCandidate.validate())
        .not.to.throw;
    });

  });

});
