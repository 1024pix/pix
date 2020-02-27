const { expect, domainBuilder, EMPTY_BLANK_AND_NULL } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-report-serializer');
const { NO_EXAMINER_COMMENT } = require('../../../../../lib/domain/models/CertificationReport');

describe('Unit | Serializer | JSONAPI | certification-report-serializer', function() {

  let certificationReport;
  let jsonApiData;

  beforeEach(() => {
    certificationReport = domainBuilder.buildCertificationReport();
    jsonApiData = {
      data: {
        type: 'certification-reports',
        id: certificationReport.id.toString(),
        attributes: {
          'certification-course-id': certificationReport.certificationCourseId,
          'first-name': certificationReport.firstName,
          'last-name': certificationReport.lastName,
          'examiner-comment': certificationReport.examinerComment,
          'has-seen-end-test-screen': certificationReport.hasSeenEndTestScreen,
        },
      }
    };
  });

  describe('#serialize()', () => {

    it('should convert a CertificationReport model object into JSON API data', function() {
      // when
      const jsonApi = serializer.serialize(certificationReport);

      // then
      expect(jsonApi).to.deep.equal(jsonApiData);
    });
  });

  describe('#deserialize()', () => {
    it('should convert a JSON API data into a CertificationReport', async function() {
      // when
      const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationReport).to.deep.equal(certificationReport);
    });
  });

  EMPTY_BLANK_AND_NULL.forEach(function(examinerComment) {
    it(`should return no examiner comment if comment is "${examinerComment}"`, async function() {
      // given
      jsonApiData.data.attributes['examiner-comment'] = examinerComment;

      // when
      const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationReport.examinerComment).to.equal(NO_EXAMINER_COMMENT);
    });

  });

});
