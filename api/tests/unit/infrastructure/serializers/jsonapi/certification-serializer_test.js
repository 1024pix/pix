const { expect, domainBuilder, EMPTY_BLANK_AND_NULL } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');
const { NO_EXAMINER_COMMENT } = require('../../../../../lib/domain/models/CertificationReport');

describe('Unit | Serializer | JSONAPI | certification-serializer', () => {

  describe('#deserialize', function() {
    let jsonCertificationCourse;
    let certificationCourseObject;

    beforeEach(function() {
      jsonCertificationCourse = {
        data: {
          type: 'certifications',
          id: 1,
          attributes: {
            'first-name': 'Freezer',
            'last-name': 'The all mighty',
            'birthplace': 'Namek',
            'birthdate': '1989-10-24',
            'delivered-at': '2020-10-24',
            'external-id': 'xenoverse2',
            'examiner-comment': 'Un signalement surveillant',
          },
        },
      };

      certificationCourseObject = {
        id: 1,
        firstName: 'Freezer',
        lastName: 'The all mighty',
        birthplace: 'Namek',
        birthdate: '1989-10-24',
        deliveredAt: '2020-10-24',
        externalId: 'xenoverse2',
        examinerComment: 'Un signalement surveillant',
      };
    });

    it('should convert a JSON API data into a Certification Course object', async function() {
      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result).to.deep.equal(certificationCourseObject);
    });

    it('should return an error if date is in wrong format', function() {
      // given
      jsonCertificationCourse.data.attributes.birthdate = '2015-32-12';

      // when
      const promise = serializer.deserialize(jsonCertificationCourse);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });

    EMPTY_BLANK_AND_NULL.forEach(function(examinerComment) {
      it(`should return no examiner comment if comment is "${examinerComment}"`, async function() {
        // given
        jsonCertificationCourse.data.attributes['examiner-comment'] = examinerComment;

        // when
        const result = await serializer.deserialize(jsonCertificationCourse);

        // then
        expect(result.examinerComment).to.equal(NO_EXAMINER_COMMENT);
      });
    });

    it('should return undefined if no examiner comment', async function() {
      // given
      jsonCertificationCourse.data.attributes['examiner-comment'] = undefined;

      // when
      const result = await serializer.deserialize(jsonCertificationCourse);

      // then
      expect(result.examinerComment).to.equal(undefined);
    });
  });

  describe('#serialize', () => {

    context('the entry data is an array of certifications', () => {

      const receivedCertifications = [
        domainBuilder.buildPrivateCertificate({
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
          verificationCode: 'P-BBBCCCDD',
        }),
      ];

      const JsonCertificationList = {
        data: [
          {
            attributes: {
              'birthdate': '1992-06-12',
              'birthplace': 'Paris',
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01T01:02:03Z'),
              'first-name': 'Jean',
              'delivered-at': new Date('2018-10-03T01:02:03Z'),
              'is-published': true,
              'last-name': 'Bon',
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
              'clea-certification-status': 'acquired',
              'verification-code': 'P-BBBCCCDD',
              'max-reachable-level-on-certification-date': 5,
            },
            'relationships': {
              'result-competence-tree': {
                'data': null,
              },
            },
            'type': 'certifications',
            'id': '1',
          },
        ],
      };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertifications);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertificationList);
      });
    });

    context('the entry data is one certification', () => {

      const receivedCertificate = domainBuilder.buildPrivateCertificate({
        pixScore: 23,
        status: 'rejected',
        certifiedProfile: null,
        commentForCandidate: 'Vous auriez dû travailler plus.',
      });

      const JsonCertification =
        {
          data: {
            attributes: {
              'birthdate': '1992-06-12',
              'birthplace': 'Paris',
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01T01:02:03Z'),
              'first-name': 'Jean',
              'delivered-at': new Date('2018-10-03T01:02:03Z'),
              'is-published': true,
              'last-name': 'Bon',
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
              'clea-certification-status': 'acquired',
              'verification-code': 'P-BBBCCCDD',
              'max-reachable-level-on-certification-date': 5,
            },
            'relationships': {
              'result-competence-tree': {
                'data': null,
              },
            },
            'type': 'certifications',
            'id': '1',
          },
        };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertificate);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertification);
      });
    });

    context('the entry data is one certification with a resultCompetenceTree set', () => {

      const assessmentResultId = 1;

      const JsonCertificationList = {
        'data': {
          'attributes': {
            'birthdate': '1992-06-12',
            'birthplace': 'Paris',
            'certification-center': 'L’univeristé du Pix',
            'date': new Date('2018-12-01T01:02:03Z'),
            'first-name': 'Jean',
            'delivered-at': new Date('2018-10-03T01:02:03Z'),
            'is-published': true,
            'last-name': 'Bon',
            'status': 'rejected',
            'pix-score': 23,
            'comment-for-candidate': 'Vous auriez dû travailler plus.',
            'clea-certification-status': 'acquired',
            'verification-code': 'P-BBBCCCDD',
            'max-reachable-level-on-certification-date': 5,
          },
          'relationships': {
            'result-competence-tree': {
              'data': {
                'id': '1-1',
                'type': 'result-competence-trees',
              },
            },
          },
          'id': '1',
          'type': 'certifications',
        },
        'included': [
          {
            'attributes': {
              'index': '1.1',
              'level': 2,
              'name': 'Mener une recherche et une veille d’information',
              'score': 13,
            },
            'id': 'recsvLz0W2ShyfD63',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.2',
              'level': -1,
              'name': 'Mener une recherche et une veille d’information',
              'score': 0,
            },
            'id': 'recNv8qhaY887jQb2',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'index': '1.3',
              'level': -1,
              'name': 'Mener une recherche et une veille d’information',
              'score': 0,
            },
            'id': 'recIkYm646lrGvLNT',
            'type': 'result-competences',
          },
          {
            'attributes': {
              'code': '1',
              'name': '1. Information et données',
              'title': 'Information et données',
              'color': 'jaffa',
            },
            'id': 'recvoGdo7z2z7pXWa',
            'relationships': {
              'result-competences': {
                'data': [
                  {
                    'id': 'recsvLz0W2ShyfD63',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recNv8qhaY887jQb2',
                    'type': 'result-competences',
                  },
                  {
                    'id': 'recIkYm646lrGvLNT',
                    'type': 'result-competences',
                  },
                ],
              },
            },
            'type': 'areas',
          },
          {
            'attributes': {
              'id': '1-1',
            },
            'id': '1-1',
            'relationships': {
              'areas': {
                'data': [
                  {
                    'id': 'recvoGdo7z2z7pXWa',
                    'type': 'areas',
                  },
                ],
              },
            },
            'type': 'result-competence-trees',
          },
        ],
      };

      it('should serialize to JSON with included relationships', () => {
        // given
        const assessmentResult = domainBuilder.buildAssessmentResult({ id: assessmentResultId });
        const receivedCertificate = domainBuilder.buildPrivateCertificateWithCompetenceTree({
          assessmentResults: [assessmentResult],
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
        });

        // when
        const serializedCertifications = serializer.serialize(receivedCertificate);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertificationList);
      });
    });
  });

  describe('#serializeForSharing', () => {

    const assessmentResultId = 1;

    const JsonCertificationList = {
      'data': {
        'attributes': {
          'birthdate': '1992-06-12',
          'birthplace': 'Paris',
          'certification-center': 'L’univeristé du Pix',
          'date': new Date('2018-12-01T01:02:03Z'),
          'first-name': 'Jean',
          'delivered-at': new Date('2018-10-03T01:02:03Z'),
          'is-published': true,
          'last-name': 'Bon',
          'status': 'rejected',
          'pix-score': 23,
          'clea-certification-status': 'acquired',
          'max-reachable-level-on-certification-date': 5,
        },
        'relationships': {
          'result-competence-tree': {
            'data': {
              'id': '1-1',
              'type': 'result-competence-trees',
            },
          },
        },
        'id': '1',
        'type': 'certifications',
      },
      'included': [
        {
          'attributes': {
            'index': '1.1',
            'level': 2,
            'name': 'Mener une recherche et une veille d’information',
            'score': 13,
          },
          'id': 'recsvLz0W2ShyfD63',
          'type': 'result-competences',
        },
        {
          'attributes': {
            'index': '1.2',
            'level': -1,
            'name': 'Mener une recherche et une veille d’information',
            'score': 0,
          },
          'id': 'recNv8qhaY887jQb2',
          'type': 'result-competences',
        },
        {
          'attributes': {
            'index': '1.3',
            'level': -1,
            'name': 'Mener une recherche et une veille d’information',
            'score': 0,
          },
          'id': 'recIkYm646lrGvLNT',
          'type': 'result-competences',
        },
        {
          'attributes': {
            'code': '1',
            'name': '1. Information et données',
            'title': 'Information et données',
            'color': 'jaffa',
          },
          'id': 'recvoGdo7z2z7pXWa',
          'relationships': {
            'result-competences': {
              'data': [
                {
                  'id': 'recsvLz0W2ShyfD63',
                  'type': 'result-competences',
                },
                {
                  'id': 'recNv8qhaY887jQb2',
                  'type': 'result-competences',
                },
                {
                  'id': 'recIkYm646lrGvLNT',
                  'type': 'result-competences',
                },
              ],
            },
          },
          'type': 'areas',
        },
        {
          'attributes': {
            'id': '1-1',
          },
          'id': '1-1',
          'relationships': {
            'areas': {
              'data': [
                {
                  'id': 'recvoGdo7z2z7pXWa',
                  'type': 'areas',
                },
              ],
            },
          },
          'type': 'result-competence-trees',
        },
      ],
    };

    it('should serialize certification into JSON data without examinerComment', () => {
      // given
      const assessmentResult = domainBuilder.buildAssessmentResult({ id: assessmentResultId });
      const receivedCertificate = domainBuilder.buildPrivateCertificateWithCompetenceTree({
        assessmentResults: [assessmentResult],
        pixScore: 23,
        status: 'rejected',
        commentForCandidate: 'Vous auriez dû travailler plus.',
      });

      // when
      const serializedCertifications = serializer.serializeForSharing(receivedCertificate);

      // then
      expect(serializedCertifications).to.deep.equal(JsonCertificationList);
    });
  });

  describe('#serializeFromCertificationCourse', () => {

    const jsonCertification = {
      data: {
        type: 'certifications',
        id: '1',
        attributes: {
          'first-name': 'Freezer',
          'last-name': 'The all mighty',
          'birthplace': 'Namek',
          'birthdate': '1989-10-24',
          'external-id': 'xenoverse2',
        },
      },
    };

    const certificationCourse = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      externalId: 'xenoverse2',
    };

    it('should serialize', () => {
      // when
      const serializedCertification = serializer.serializeFromCertificationCourse(certificationCourse);
      // then
      expect(serializedCertification).to.deep.equal(jsonCertification);
    });
  });
});
