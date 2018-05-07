const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize()', function() {

    it('should convert a Certification Course model object into JSON API data', function() {
      // given
      const assessment = new Assessment({
        'id': '2',
      });

      const certificationCourse = new CertificationCourse({
        id: 'certification_id',
        userId: 2,
        assessment: assessment,
        nbChallenges: 3,
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'courses',
          id: 'certification_id',
          attributes: {
            'user-id': '2',
            'type': 'CERTIFICATION',
            'nb-challenges': 3,
          },
          relationships: {
            assessment: {
              data: {
                id: '2',
                type: 'assessments',
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
      const certificationCourse = new CertificationCourse({
        pixScore: 30,
        createdAt: '20/02/2017',
        completedAt: '20/02/2017',
        competencesWithMark: [],
        firstName: 'Guy-Manuel',
        lastName: 'De Homem Christo',
        birthdate: '08/02/1974',
        birthplace: 'Neuilly-Sur-Seine',
        sessionId: '#DaftPunk',
        externalId: 'Grammys2016',
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
            'session-id': '#DaftPunk',
            'external-id': 'Grammys2016',
          },
        },
      });
    });
  });

  describe('#serializeAsCertification', function() {

    const jsonCertificationCourse = {
      data: {
        type: 'certifications',
        id: 1,
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '24/10/1989',
          'external-id': 'xenoverse2',
        },
      },
    };

    const certificationCourse = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '24/10/1989',
      externalId: 'xenoverse2',
    };

    it('should serialize', function() {
      // when
      const serializedCertificationCourse = serializer.serializeAsCertification(certificationCourse);
      // then
      expect(serializedCertificationCourse).to.deep.equal(jsonCertificationCourse);
    });
  });
});
