const { expect, domainBuilder } = require('../../../../test-helper');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');
const _ = require('lodash');

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function() {

  let certificationCandidate;
  let jsonApiData;

  beforeEach(() => {
    certificationCandidate = domainBuilder.buildCertificationCandidate();
    jsonApiData = {
      data: {
        type: 'certification-candidates',
        id: certificationCandidate.id.toString(),
        attributes: {
          'first-name': certificationCandidate.firstName,
          'last-name': certificationCandidate.lastName,
          'birth-city': certificationCandidate.birthCity,
          'birth-province-code': certificationCandidate.birthProvinceCode,
          'birth-country': certificationCandidate.birthCountry,
          'email': certificationCandidate.email,
          'birthdate': certificationCandidate.birthdate,
          'external-id': certificationCandidate.externalId,
          'extra-time-percentage': certificationCandidate.extraTimePercentage,
          'is-linked': !_.isNil(certificationCandidate.userId),
        },
      }
    };
  });

  describe('#serialize()', () => {

    it('should convert a CertificationCandidate model object into JSON API data', function() {
      // when
      const jsonApi = serializer.serialize(certificationCandidate);

      // then
      expect(jsonApi).to.deep.equal(jsonApiData);
    });

  });

  describe('#deserialize()', () => {

    it('should convert JSON API data into a CertificationCandidate model object', async function() {
      // when
      const deserializedCertificationCandidate = await serializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationCandidate).to.be.instanceOf(CertificationCandidate);
      expect(deserializedCertificationCandidate.firstName).to.equal(certificationCandidate.firstName);
      expect(deserializedCertificationCandidate.lastName).to.equal(certificationCandidate.lastName);
      expect(deserializedCertificationCandidate.birthdate).to.equal(certificationCandidate.birthdate);
      expect(deserializedCertificationCandidate.birthProvinceCode).to.equal(certificationCandidate.birthProvinceCode);
      expect(deserializedCertificationCandidate.birthCity).to.equal(certificationCandidate.birthCity);
      expect(deserializedCertificationCandidate.birthCountry).to.equal(certificationCandidate.birthCountry);
      expect(deserializedCertificationCandidate.extraTimePercentage).to.equal(certificationCandidate.extraTimePercentage);
      expect(deserializedCertificationCandidate.externalId).to.equal(certificationCandidate.externalId);
      expect(deserializedCertificationCandidate.email).to.equal(certificationCandidate.email);
      expect(deserializedCertificationCandidate.hasSeenEndTestScreen).to.equal(certificationCandidate.hasSeenEndTestScreen);
      expect(deserializedCertificationCandidate.examinerComment).to.equal(certificationCandidate.examinerComment);
    });

  });

});
