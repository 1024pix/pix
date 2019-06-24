const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-course-serializer');
const Assessment = require('../../../../../lib/domain/models/Assessment');
const CertificationCourse = require('../../../../../lib/domain/models/CertificationCourse');

describe('Unit | Serializer | JSONAPI | certification-course-serializer', function() {

  describe('#serialize', function() {

    it('should convert a Certification Course model object into JSON API data', function() {
      // given
      const assessment = Assessment.fromAttributes({
        'id': '2',
      });

      const certificationCourse = CertificationCourse.fromAttributes({
        id: 'certification_id',
        userId: 2,
        assessment: assessment,
        nbChallenges: 3,
        birthdate: '14 Jan 2005',
        birthplace: 'Guantanamo',
        firstName: 'José',
        lastName: 'Ock',
        externalId: 5,
      });

      const jsonCertificationCourseWithAssessment = {
        data: {
          type: 'courses',
          id: 'certification_id',
          attributes: {
            'user-id': '2',
            type: 'CERTIFICATION',
            'nb-challenges': 3,
            birthdate: '14 Jan 2005',
            birthplace: 'Guantanamo',
            'first-name': 'José',
            'last-name': 'Ock',
            'external-id': 5,
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
