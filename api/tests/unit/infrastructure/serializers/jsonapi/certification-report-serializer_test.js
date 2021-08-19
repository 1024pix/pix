const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-report-serializer');

describe('Unit | Serializer | JSONAPI | certification-report-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a CertificationReport model object into JSON API data', function() {
      // given
      const certificationReport = domainBuilder.buildCertificationReport({ certificationIssueReports: [] });
      const jsonApiData = {
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
          relationships: {
            'certification-issue-reports': {
              data: [],
            },
          },
        },
      };

      // when
      const jsonApi = serializer.serialize(certificationReport);

      // then
      expect(jsonApi).to.deep.equal(jsonApiData);
    });

    it('should include CertificationIssueReports if any into JSON API data', function() {
      // given
      const certificationReport = domainBuilder.buildCertificationReport();
      const certificationIssueReport = certificationReport.certificationIssueReports[0];
      const jsonApiDataRelationship = {
        data: [{
          type: 'certificationIssueReports',
          id: certificationIssueReport.id.toString(),
        }],
      };
      const jsonApiDataIncluded = [{
        type: 'certificationIssueReports',
        id: certificationIssueReport.id.toString(),
        attributes: {
          category: certificationIssueReport.category,
          description: certificationIssueReport.description,
          subcategory: certificationIssueReport.subcategory,
          'question-number': certificationIssueReport.questionNumber,
        },
      }];

      // when
      const jsonApi = serializer.serialize(certificationReport);

      // then
      expect(jsonApi.included).to.deep.equal(jsonApiDataIncluded);
      expect(jsonApi.data.relationships['certification-issue-reports']).to.deep.equal(jsonApiDataRelationship);
    });
  });

  describe('#deserialize()', function() {
    it('should convert a JSON API data into a CertificationReport', async function() {
      const certificationReport = domainBuilder.buildCertificationReport({ certificationIssueReports: [] });
      const jsonApiData = {
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
        },
      };

      // when
      const deserializedCertificationReport = await serializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationReport).to.deep.equal(certificationReport);
    });
  });

});
