const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

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
        'examinerComment': 'Signalement de l\'examinateur',
        'hasSeenEndTestScreen': true,
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: 'certification_id',
          attributes: {
            'nb-challenges': 2,
            'examiner-comment': 'Signalement de l\'examinateur',
            'has-seen-end-test-screen': true,
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
