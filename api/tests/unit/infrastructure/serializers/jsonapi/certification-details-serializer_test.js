import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/certification-details-serializer';
import { states } from '../../../../../lib/domain/models/CertificationAssessment';

describe('Unit | Serializer | JSONAPI | certification-details-serializer', function () {
  describe('#serialize', function () {
    it('should convert a Certification Details model object into JSON API data', function () {
      // given
      const certificationDetails = domainBuilder.buildCertificationDetails({
        id: 123,
        userId: 456,
        createdAt: new Date('2020-01-01'),
        completedAt: new Date('2020-03-03'),
        status: states.COMPLETED,
        totalScore: 555,
        percentageCorrectAnswers: 75,
        competencesWithMark: [
          {
            areaCode: '1',
            id: 'recComp1',
            index: '1.1',
            name: 'manger des fruits',
            obtainedLevel: 1,
            obtainedScore: 9,
            positionedLevel: 2,
            positionedScore: 17,
          },
        ],
        listChallengesAndAnswers: [
          {
            challengeId: 'recChal1',
            competence: '1.1',
            result: 'ok',
            skill: 'manger une mangue',
            value: 'miam',
          },
        ],
      });

      const expectedSerializedCertificationDetails = {
        data: {
          type: 'certification-details',
          id: '123',
          attributes: {
            'user-id': 456,
            'created-at': new Date('2020-01-01'),
            'completed-at': new Date('2020-03-03'),
            status: states.COMPLETED,
            'total-score': 555,
            'percentage-correct-answers': 75,
            'competences-with-mark': [
              {
                areaCode: '1',
                id: 'recComp1',
                index: '1.1',
                name: 'manger des fruits',
                obtainedLevel: 1,
                obtainedScore: 9,
                positionedLevel: 2,
                positionedScore: 17,
              },
            ],
            'list-challenges-and-answers': [
              {
                challengeId: 'recChal1',
                competence: '1.1',
                result: 'ok',
                skill: 'manger une mangue',
                value: 'miam',
              },
            ],
          },
        },
      };

      // when
      const serializedCertificationDetails = serializer.serialize(certificationDetails);

      // then
      expect(serializedCertificationDetails).to.deep.equal(expectedSerializedCertificationDetails);
    });
  });
});
