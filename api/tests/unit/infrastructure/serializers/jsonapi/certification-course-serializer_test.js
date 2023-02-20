import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer';
import Assessment from '../../../../../lib/domain/models/Assessment';
import CertificationCourse from '../../../../../lib/domain/models/CertificationCourse';
import CertificationIssueReport from '../../../../../lib/domain/models/CertificationIssueReport';
import { CertificationIssueReportCategories } from '../../../../../lib/domain/models/CertificationIssueReportCategory';

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Certification Course model object into JSON API data', function () {
      // given
      const assessment = new Assessment({
        id: 'assessment_id',
      });
      const certificationCourse = new CertificationCourse({
        id: 1,
        assessment: assessment,
        challenges: ['challenge1', 'challenge2'],
        certificationIssueReports: [],
        hasSeenEndTestScreen: true,
      });

      const issueReport = new CertificationIssueReport({
        id: 1234,
        description: "Signalement de l'examinateur",
        category: CertificationIssueReportCategories.OTHER,
        certificationCourseId: certificationCourse.getId(),
      });

      certificationCourse.reportIssue(issueReport);

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: '1',
          attributes: {
            'nb-challenges': 2,
            'examiner-comment': "Signalement de l'examinateur",
            'has-seen-end-test-screen': true,
            'first-name': certificationCourse.toDTO().firstName,
            'last-name': certificationCourse.toDTO().lastName,
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
      const json = serializer.serialize(certificationCourse, true);

      // then
      expect(json).to.deep.equal(jsonCertificationCourseWithAssessment);
    });

    it('should not serialize examinerComment if no issue report', function () {
      // given
      const assessment = new Assessment({
        id: 'assessment_id',
      });
      const certificationCourse = new CertificationCourse({
        id: 1,
        assessment: assessment,
        challenges: ['challenge1', 'challenge2'],
        certificationIssueReports: undefined,
        hasSeenEndTestScreen: true,
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: '1',
          attributes: {
            'nb-challenges': 2,
            'examiner-comment': undefined,
            'has-seen-end-test-screen': true,
            'first-name': certificationCourse.toDTO().firstName,
            'last-name': certificationCourse.toDTO().lastName,
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

    it('should count 0 challenges when no challenges', function () {
      // given
      const assessment = new Assessment({
        id: 'assessment_id',
      });
      const certificationCourse = new CertificationCourse({
        id: 1,
        assessment: assessment,
        challenges: undefined,
        certificationIssueReports: undefined,
        hasSeenEndTestScreen: true,
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: '1',
          attributes: {
            'nb-challenges': 0,
            'examiner-comment': undefined,
            'has-seen-end-test-screen': true,
            'first-name': certificationCourse.toDTO().firstName,
            'last-name': certificationCourse.toDTO().lastName,
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
