const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/jury-certification-summary-serializer');
const JuryCertificationSummary = require('../../../../../lib/domain/read-models/JuryCertificationSummary');

describe('Unit | Serializer | JSONAPI | jury-certification-summary-serializer', function () {
  describe('#serialize()', function () {
    let modelJuryCertifSummary;
    let expectedJsonApi;

    beforeEach(function () {
      const issueReport = domainBuilder.buildCertificationIssueReport.impactful({
        certificationCourseId: 1,
        description: 'someComment',
        resolvedAt: null,
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
        isCancelled: true,
        certificationIssueReports: [issueReport],
        hasSeenEndTestScreen: false,
        isFlaggedAborted: false,
        complementaryCertificationTakenLabels: ['CléA Numérique', 'Pix+ Droit Maître', 'Pix+ Édu 2nd degré Avancé'],
      });

      expectedJsonApi = {
        data: {
          type: 'jury-certification-summaries',
          id: modelJuryCertifSummary.id.toString(),
          attributes: {
            'first-name': modelJuryCertifSummary.firstName,
            'last-name': modelJuryCertifSummary.lastName,
            status: modelJuryCertifSummary.status,
            'pix-score': modelJuryCertifSummary.pixScore,
            'created-at': modelJuryCertifSummary.createdAt,
            'completed-at': modelJuryCertifSummary.completedAt,
            'is-published': modelJuryCertifSummary.isPublished,
            'is-cancelled': true,
            'examiner-comment': 'someComment',
            'number-of-certification-issue-reports': 1,
            'number-of-certification-issue-reports-with-required-action': 1,
            'has-seen-end-test-screen': modelJuryCertifSummary.hasSeenEndTestScreen,
            'is-flagged-aborted': false,
            'complementary-certification-taken-labels': [
              'CléA Numérique',
              'Pix+ Droit Maître',
              'Pix+ Édu 2nd degré Avancé',
            ],
          },
        },
      };
    });

    it('should convert a JuryCertificationSummary model object into JSON API data', function () {
      // when
      const json = serializer.serialize(modelJuryCertifSummary);

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
