const { expect, domainBuilder } = require('../../../../test-helper');
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
          'certification-course-id': !_.isUndefined(certificationCandidate.certificationCourse) ?
            certificationCandidate.certificationCourse.id : undefined,
          'examiner-comment': certificationCandidate.examinerComment,
          'has-seen-end-test-screen': certificationCandidate.hasSeenEndTestScreen,
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
      const json = await serializer.deserialize(jsonApiData);

      // then
      delete certificationCandidate.createdAt;
      delete certificationCandidate.sessionId;
      delete certificationCandidate.userId;
      delete certificationCandidate.certificationCourse;
      certificationCandidate.id += '';
      expect(json).to.deep.equal(certificationCandidate, ['userId']);
    });

  });

});
