const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function() {

  const certificationCandidate = domainBuilder.buildCertificationCandidate();
  let jsonApiData;

  beforeEach(() => {
    jsonApiData = {
      data: {
        type: 'certification-candidates',
        id: certificationCandidate.id.toString(),
        attributes: {
          'first-name': certificationCandidate.firstName,
          'last-name': certificationCandidate.lastName,
          'birthplace': certificationCandidate.birthplace,
          'birthdate': certificationCandidate.birthdate,
          'external-id': certificationCandidate.externalId,
          'extra-time-percentage': certificationCandidate.extraTimePercentage,
        },
      }
    };
  });

  describe('#serialize()', () => {

    it('should convert a CertificationCandidate model object into JSON API data', function() {
      // when
      const json = serializer.serialize(certificationCandidate);

      // then
      expect(json).to.deep.equal(jsonApiData);
    });

  });

});
