const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-candidate-serializer');
const CertificationCandidate = require('../../../../../lib/domain/models/CertificationCandidate');

describe('Unit | Serializer | JSONAPI | certification-candidate-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Candidate model object into JSON API data', function() {
      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      const jsonCertificationCandidate = {
        data: {
          type: 'certification-candidates',
          id: certificationCandidate.id.toString(),
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-country': certificationCandidate.birthCountry,
            'birth-province': certificationCandidate.birthProvince,
            'birth-city': certificationCandidate.birthCity,
            'external-id': certificationCandidate.externalId,
            'birthdate': certificationCandidate.birthdate,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'created-at': certificationCandidate.createdAt,
          },
          relationships: {
            session: {
              data: {
                type: 'sessions',
                id: certificationCandidate.sessionId.toString(),
              },
            },
          },
        },
      };

      // when
      const json = serializer.serialize(certificationCandidate);

      // then
      expect(json).to.deep.equal(jsonCertificationCandidate);
    });

  });

  describe('#deserialize', function() {

    it('should convert JSON API certification candidate data into a Certification Candidate model object', async () => {

      // given
      const certificationCandidate = domainBuilder.buildCertificationCandidate({});
      const jsonApi = {
        data: {
          type: 'certificationCandidates',
          id: certificationCandidate.id,
          attributes: {
            'first-name': certificationCandidate.firstName,
            'last-name': certificationCandidate.lastName,
            'birth-country': certificationCandidate.birthCountry,
            'birth-province': certificationCandidate.birthProvince,
            'birth-city': certificationCandidate.birthCity,
            'external-id': certificationCandidate.externalId,
            'birthdate': certificationCandidate.birthdate,
            'extra-time-percentage': certificationCandidate.extraTimePercentage,
            'created-at': certificationCandidate.createdAt,
          },
          relationships: {
            session: {
              data: {
                type: 'sessions',
                id: certificationCandidate.sessionId,
              },
            },
          },
        },
      };

      // when
      const deserializedCertificationCandidate = await serializer.deserialize(jsonApi);

      // then
      expect(deserializedCertificationCandidate).to.be.instanceOf(CertificationCandidate);
      expect(deserializedCertificationCandidate).to.deep.equal(certificationCandidate);
    });

  });

});
