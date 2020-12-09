const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');
const CertificationIssueReport = require('../../../../../lib/domain/models/CertificationIssueReport');
const { CertificationIssueReportCategories } = require('../../../../../lib/domain/models/CertificationIssueReportCategory');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Course model object into JSON API data', function() {
      // given
      const assessment = new Assessment({
        'id': 'assessment_id',
      });
      const certificationCourse = new CertificationCourse({
        id: 'certification_id',
        assessment: assessment,
        challenges: ['challenge1', 'challenge2'],
        certificationIssueReports: [],
        'hasSeenEndTestScreen': true,
      });

      const issueReport = new CertificationIssueReport({
        id: 1234,
        description: 'Signalement de l\'examinateur',
        categoryId: CertificationIssueReportCategories.OTHER,
        certificationCourseId: certificationCourse.id,
      });

      certificationCourse.reportIssue(issueReport);

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: 'certification_id',
          attributes: {
            'nb-challenges': 2,
            'examiner-comment': 'Signalement de l\'examinateur',
            'has-seen-end-test-screen': true,
            'first-name': certificationCourse.firstName,
            'last-name': certificationCourse.lastName,
          },
          relationships: {
            assessment: {
              links: {
                related: '/api/assessments/assessment_id',
              },
            },
          },
        },
      };

      // when
      const json = serializer.serialize(certificationCourse);

      // then
      expect(json).to.deep.equal(jsonCertificationCourseWithAssessment);
    });
  });
});
