const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-serializer');
const { WrongDateFormatError } = require('../../../../../lib/domain/errors');

describe('Unit | Serializer | JSONAPI | certification-serializer', () => {

  describe('#deserialize', function() {

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

    const certificationCourseObject = {
      id: 1,
      firstName: 'Freezer',
      lastName: 'The all mighty',
      birthplace: 'Namek',
      birthdate: '1989-10-24',
      externalId: 'xenoverse2',
    };

    it('should convert a JSON API data into a Certification Course object', function() {
      // when
      const certificationCourse = serializer.deserialize(jsonCertificationCourse);

      // then

      return certificationCourse.then((result) => {
        expect(result).to.deep.equal(certificationCourseObject);
      });
    });

    it('should return an error if date is in wrong format', function() {
      // when
      jsonCertificationCourse.data.attributes.birthdate = '2015-32-12';

      // given
      const promise = serializer.deserialize(jsonCertificationCourse);

      // then
      return promise.catch(() => {
        expect(promise).to.be.rejectedWith(WrongDateFormatError);
      });
    });
  });

  describe('#serialize', () => {

    context('the entry data is an array of certifications', () => {

      const receivedCertifications = [
        domainBuilder.buildCertification({
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
        }),
      ];

      const JsonCertificationList = {
        data: [
          {
            attributes: {
              'birthdate': new Date('1992-06-12'),
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01'),
              'first-name': 'Jean',
              'is-published': true,
              'last-name': 'Bon',
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
            },
            'relationships': {
              'result-competence-tree': {
                'data': null,
              },
            },
            'type': 'certifications',
            'id': 1,
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

      const receivedCertification = domainBuilder.buildCertification({
        pixScore: 23,
        status: 'rejected',
        certifiedProfile: null,
        commentForCandidate: 'Vous auriez dû travailler plus.',
      });

      const JsonCertification =
        {
          data: {
            attributes: {
              'birthdate': new Date('1992-06-12'),
              'certification-center': 'L’univeristé du Pix',
              'date': new Date('2018-12-01'),
              'first-name': 'Jean',
              'is-published': true,
              'last-name': 'Bon',
              'status': 'rejected',
              'pix-score': 23,
              'comment-for-candidate': 'Vous auriez dû travailler plus.',
            },
            'relationships': {
              'result-competence-tree': {
                'data': null,
              },
            },
            'type': 'certifications',
            'id': 1,
          },
        };

      it('should serialize user certifications to JSON', () => {
        // when
        const serializedCertifications = serializer.serialize(receivedCertification);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertification);
      });
    });

    context('the entry data is one certification with a resultCompetenceTree set', () => {

      const JsonCertificationList = {
        'data': {
          'attributes': {
            'birthdate': new Date('1992-06-12'),
            'certification-center': 'L’univeristé du Pix',
            'date': new Date('2018-12-01'),
            'first-name': 'Jean',
            'is-published': true,
            'last-name': 'Bon',
            'status': 'rejected',
            'pix-score': 23,
            'comment-for-candidate': 'Vous auriez dû travailler plus.',
          },
          'relationships': {
            'result-competence-tree': {
              'data': {
                'id': '1-1',
                'type': 'result-competence-trees',
              },
            },
          },
          'id': 1,
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
        const receivedCertification = domainBuilder.buildCertificationWithCompetenceTree({
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
        });

        // when
        const serializedCertifications = serializer.serialize(receivedCertification);

        // then
        expect(serializedCertifications).to.deep.equal(JsonCertificationList);
      });
    });
  });

  describe('#serializeFromCertificationCourse', () => {

    const jsonCertification = {
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

    it('should serialize', () => {
      // when
      const serializedCertification = serializer.serializeFromCertificationCourse(certificationCourse);
      // then
      expect(serializedCertification).to.deep.equal(jsonCertification);
    });
  });
});
