const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-summary-serializer');
const JuryCertificationSummary = require('../../../../../lib/domain/read-models/JuryCertificationSummary');
const CertificationIssueReport = require('../../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Serializer | JSONAPI | jury-certification-summary-serializer', function() {

  describe('#serialize()', function() {

    let modelJuryCertifSummary;
    let expectedJsonApi;

    beforeEach(() => {
      const issueReport = new CertificationIssueReport({
        certificationCourseId: 1,
        description: 'someComment',
        category: CertificationIssueReportCategories.OTHER,
      });
      modelJuryCertifSummary = new JuryCertificationSummary({
        id: 1,
        firstName: 'someFirstName',
        lastName: 'someLastName',
        status: 'someStatus',
        pixScore: 123,
        createdAt: new Date('2020-04-20T04:05:06Z'),
        completedAt: new Date('2020-04-25T04:05:06Z'),
        isPublished: true,
        certificationIssueReports: [issueReport],
        hasSeenEndTestScreen: false,
        cleaCertificationStatus: true,
      });

      expectedJsonApi = {
        data: {
          type: 'jury-certification-summaries',
          id: modelJuryCertifSummary.id.toString(),
          attributes: {
            'first-name': modelJuryCertifSummary.firstName,
            'last-name': modelJuryCertifSummary.lastName,
            'status': modelJuryCertifSummary.status,
            'pix-score': modelJuryCertifSummary.pixScore,
            'created-at': modelJuryCertifSummary.createdAt,
            'completed-at': modelJuryCertifSummary.completedAt,
            'is-published': modelJuryCertifSummary.isPublished,
            'examiner-comment': 'someComment',
            'has-seen-end-test-screen': modelJuryCertifSummary.hasSeenEndTestScreen,
            'clea-certification-status': 'acquired',
          },
        },
      };
    });

    it('should convert a JuryCertificationSummary model object into JSON API data', function() {
      // when
      const json = serializer.serialize(modelJuryCertifSummary);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });

});
