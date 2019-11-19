const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Course model object into JSON API data', function() {
      // given
      const assessment = Assessment.fromAttributes({
        'id': 'assessment_id',
      });

      const certificationCourse = CertificationCourse.fromAttributes({
        id: 'certification_id',
        assessment: assessment,
        challenges: ['challenge1', 'challenge2'],
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'certification-courses',
          id: 'certification_id',
          attributes: {
            'nb-challenges': 2,
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

  describe('#serializeResult', function() {

    it('should serialize results of a certification', function() {
      // given
      const certificationCourse = CertificationCourse.fromAttributes({
        pixScore: 30,
        createdAt: new Date('2017-02-20T01:02:03Z'),
        completedAt: new Date('2017-02-20T01:02:03Z'),
        competencesWithMark: [],
        firstName: 'Guy-Manuel',
        lastName: 'De Homem Christo',
        birthdate: '1974-02-08',
        birthplace: 'Neuilly-Sur-Seine',
        sessionId: '#DaftPunk',
        externalId: 'Grammys2016',
        isPublished: true,
        isV2Certification: true,
      });

      // when
      const serializedCertificationCourse = serializer.serializeResult(certificationCourse);

      // then
      expect(serializedCertificationCourse).to.deep.equal({
        'data': {
          'type': 'results',
          'attributes': {
            'competences-with-mark': [],
            'completed-at': new Date('2017-02-20T01:02:03Z'),
            'created-at': new Date('2017-02-20T01:02:03Z'),
            'pix-score': 30,
            'first-name': 'Guy-Manuel',
            'last-name': 'De Homem Christo',
            'birthdate': '1974-02-08',
            'birthplace': 'Neuilly-Sur-Seine',
            'session-id': '#DaftPunk',
            'external-id': 'Grammys2016',
            'is-published': true,
            'is-v2-certification': true,
          },
        },
      });
    });
  });
});
