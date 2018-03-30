const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Certification Course model object into JSON API data', function() {
      // given
      const assessment = new Assessment({
        'id': '2'
      });

      const certificationCourse = new CertificationCourse({
        id: 'certification_id',
        userId: 2,
        status: 'completed',
        assessment: assessment,
        nbChallenges: 3
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'courses',
          id: 'certification_id',
          attributes: {
            'user-id': '2',
            'status': 'completed',
            'type': 'CERTIFICATION',
            'nb-challenges': 3
          },
          relationships: {
            assessment: {
              data: {
                id: '2',
                type: 'assessments'
              }
            }
          }
        }
      };

      // when
      const json = serializer.serialize(certificationCourse);

      // then
      expect(json).to.deep.equal(jsonCertificationCourseWithAssessment);
    });
  });

  describe('#serializeResult', function() {

    it('should serialize results of a certification', function() {
      // given
      const certificationCourse = new CertificationCourse({
        pixScore: 30,
        createdAt: '20/02/2017',
        completedAt: '20/02/2017',
        competencesWithMark: [],
        firstName: 'Guy-Manuel',
        lastName: 'De Homem Christo',
        birthdate: '08/02/1974',
        birthplace: 'Neuilly-Sur-Seine',
        rejectionReason: '',
        sessionId: '#DaftPunk',
      });

      // when
      const serializedCertificationCourse = serializer.serializeResult(certificationCourse);

      // then
      expect(serializedCertificationCourse).to.deep.equal({
        'data': {
          'type': 'results',
          'attributes': {
            'competences-with-mark': [],
            'completed-at': '20/02/2017',
            'created-at': '20/02/2017',
            'pix-score': 30,
            'first-name': 'Guy-Manuel',
            'last-name': 'De Homem Christo',
            'birthdate': '08/02/1974',
            'birthplace': 'Neuilly-Sur-Seine',
            'rejection-reason': '',
            'session-id': '#DaftPunk',
          },
        }
      });
    });
  });
});
