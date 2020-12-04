const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-issue-report-serializer');

const CertificationIssueReport = require('../../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Serializer | JSONAPI | certification-issue-serializer', function () {

  describe('#deserialize()', function () {

    it('should convert JSON API data to a CertificagtionIssueReport', function () {
      // given
      const certificationCourseId = 1;
      const description = 'Il y a eu un problème';
      const json = {
        data: {
          attributes: {
            category: 'OTHER',
            description,
          },
          relationships: {
            'certification-report': {
              data: {
                type: 'certification-reports',
                id: 'CertificationReport:103836'
              }
            }
          },
          type: 'certification-issue-reports',
        }
      };
      const request = {
        params: { id: certificationCourseId },
        payload: json,
      }

      // when
      const certificationIssueReport = serializer.deserialize(request);

      // then
      const expectedCertificationIssueReport = new CertificationIssueReport({
        certificationCourseId,
        category: CertificationIssueReportCategories.OTHER,
        description,
      });
      expect(certificationIssueReport).to.be.instanceOf(CertificationIssueReport);
      expect(certificationIssueReport).to.deep.equal(expectedCertificationIssueReport);
    });
  });

});
