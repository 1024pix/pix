import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/session-for-supervising-serializer';
import Assessment from '../../../../../lib/domain/models/Assessment';

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a SessionForSupervising model object into JSON API data', function () {
      // given
      const expectedPayload = {
        data: {
          attributes: {
            'certification-center-name': 'Toto',
            'access-code': 'CODE12',
            date: '2017-01-20',
            examiner: 'Antoine Toutvenant',
            room: '28D',
            time: '14:30',
          },
          id: '12',
          relationships: {
            'certification-candidates': {
              data: [
                {
                  id: '1234',
                  type: 'certification-candidate-for-supervising',
                },
              ],
            },
          },
          type: 'sessionForSupervising',
        },
        included: [
          {
            attributes: {
              birthdate: '28/05/1984',
              'extra-time-percentage': 33,
              'first-name': 'toto',
              id: 1234,
              'last-name': 'tata',
              'authorized-to-start': true,
              'assessment-status': Assessment.states.STARTED,
              'start-date-time': new Date('2022-10-01T13:37:00Z'),
            },
            id: '1234',
            type: 'certification-candidate-for-supervising',
          },
        ],
      };

      const modelSession = domainBuilder.buildSessionForSupervising({
        id: 12,
        address: 'Nice',
        room: '28D',
        examiner: 'Antoine Toutvenant',
        accessCode: 'CODE12',
        date: '2017-01-20',
        time: '14:30',
        certificationCenterName: 'Toto',
        certificationCandidates: [
          {
            id: 1234,
            firstName: 'toto',
            lastName: 'tata',
            birthdate: '28/05/1984',
            extraTimePercentage: 33,
            authorizedToStart: true,
            assessmentStatus: Assessment.states.STARTED,
            startDateTime: new Date('2022-10-01T13:37:00Z'),
          },
        ],
      });

      // when
      const actualPayload = serializer.serialize(modelSession);

      // then
      expect(actualPayload).to.deep.equal(expectedPayload);
    });
  });
});
