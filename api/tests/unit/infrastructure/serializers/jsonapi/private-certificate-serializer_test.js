const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/private-certificate-serializer');

describe('Unit | Serializer | JSONAPI | private-certificate-serializer', () => {

  describe('#serialize', () => {

    context('the entry data is an array of certifications', () => {

      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.acquired();
      const privateCertificates = [
        domainBuilder.buildPrivateCertificate({
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
          verificationCode: 'P-BBBCCCDD',
          cleaCertificationResult,
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
        const serializedPrivateCertificates = serializer.serialize(privateCertificates);

        // then
        expect(serializedPrivateCertificates).to.deep.equal(JsonCertificationList);
      });
    });

    context('the entry data is one certification', () => {

      const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.rejected();
      const privateCertificate = domainBuilder.buildPrivateCertificate({
        pixScore: 23,
        status: 'rejected',
        commentForCandidate: 'Vous auriez dû travailler plus.',
        cleaCertificationResult,
      });

      const JsonCertification = {
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
            'clea-certification-status': 'rejected',
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
        const serializedPrivateCertificate = serializer.serialize(privateCertificate);

        // then
        expect(serializedPrivateCertificate).to.deep.equal(JsonCertification);
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
            'clea-certification-status': 'not_passed',
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
        const cleaCertificationResult = domainBuilder.buildCleaCertificationResult.notPassed();
        const privateCertificate = domainBuilder.buildPrivateCertificateWithCompetenceTree({
          assessmentResults: [assessmentResult],
          pixScore: 23,
          status: 'rejected',
          commentForCandidate: 'Vous auriez dû travailler plus.',
          cleaCertificationResult,
        });

        // when
        const serializedPrivateCertificate = serializer.serialize(privateCertificate);

        // then
        expect(serializedPrivateCertificate).to.deep.equal(JsonCertificationList);
      });
    });
  });
});
