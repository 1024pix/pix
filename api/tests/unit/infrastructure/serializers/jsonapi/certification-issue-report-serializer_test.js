const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-issue-report-serializer');

const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Serializer | JSONAPI | certification-issue-serializer', function() {

  describe('#deserialize()', function() {

    it('should convert JSON API data to a CertificagtionIssueReport', function() {
      // given
      const certificationCourseId = 1;
      const description = '65%';
      const json = {
        data: {
          attributes: {
            category: 'CANDIDATE_INFORMATIONS_CHANGES',
            description,
            subcategory: 'EXTRA_TIME_PERCENTAGE',
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
        category: CertificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
        description,
        subcategory: 'EXTRA_TIME_PERCENTAGE',
      };
      expect(certificationIssueReport).to.deep.equal(expectedCertificationIssueReport);
    });
  });

});
