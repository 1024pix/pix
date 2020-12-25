const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-issue-report-serializer');

const { CertificationIssueReportCategories, CertificationIssueReportSubcategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Serializer | JSONAPI | certification-issue-report-serializer', function() {

  describe('#serialize()', () => {

    it('should convert a CertificationIssueReport model object into JSON API data', () => {
      // given
      const certificationIssueReport = domainBuilder.buildCertificationIssueReport();
      const jsonApiData = {
        data: {
          type: 'certification-issue-reports',
          id: certificationIssueReport.id.toString(),
          attributes: {
            category: certificationIssueReport.category,
            description: certificationIssueReport.description,
            subcategory: certificationIssueReport.subcategory,
            'question-number': certificationIssueReport.questionNumber,
          },
        },
      };

      // when
      const jsonApi = serializer.serialize(certificationIssueReport);

      // then
      expect(jsonApi).to.deep.equal(jsonApiData);
    });
  });

  describe('#deserialize()', function() {

    it('should convert JSON API data to a CertificationIssueReport', function() {
      // given
      const certificationCourseId = 1;
      const description = '65%';
      const questionNumber = 6;
      const json = {
        data: {
          attributes: {
            category: 'IN_CHALLENGE',
            description,
            subcategory: 'IMAGE_NOT_DISPLAYING',
            'question-number': questionNumber,
          },
          relationships: {
            'certification-report': {
              data: {
                type: 'certification-reports',
                id: 'CertificationReport:103836',
              },
            },
          },
          type: 'certification-issue-reports',
        },
      };
      const request = {
        params: { id: certificationCourseId },
        payload: json,
      };

      // when
      const certificationIssueReport = serializer.deserialize(request);

      // then
      const expectedCertificationIssueReport = {
        certificationCourseId,
        category: CertificationIssueReportCategories.IN_CHALLENGE,
        description,
        subcategory: CertificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
        questionNumber,
      };
      expect(certificationIssueReport).to.deep.equal(expectedCertificationIssueReport);
    });
  });

});
