const { expect, domainBuilder } = require('../../../../test-helper');
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

  it('should return no examiner comment for an undefined examiner comment', async function() {
    // when
    delete jsonApiData.data.attributes['examiner-comment'];
    const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

    // then
    expect(deserializedCertificationReport.examinerComment).to.equal(NO_EXAMINER_COMMENT);
  });

  it('should return no examiner comment for an empty examiner comment', async function() {
    // when
    jsonApiData.data.attributes['examiner-comment'] = '';
    const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

    // then
    expect(deserializedCertificationReport.examinerComment).to.equal(NO_EXAMINER_COMMENT);
  });

  it('should return no examiner comment for a blank examiner comment', async function() {
    // when
    jsonApiData.data.attributes['examiner-comment'] = '\t \n';
    const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

    // then
    expect(deserializedCertificationReport.examinerComment).to.equal(NO_EXAMINER_COMMENT);
  });

});
