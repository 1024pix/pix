const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/session-for-supervising-serializer');

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a SessionForSupervising model object into JSON API data', function () {
      // given
      const expectedPayload = {
        data: {
          attributes: {
            'certification-center-name': 'Toto',
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
        date: '2017-01-20',
        time: '14:30',
        certificationCenterName: 'Toto',
        certificationCandidates: [
          {
            id: 1234,
            firstName: 'toto',
            lastName: 'tata',
            sex: 'M',
            birthPostalCode: '75000',
            birthInseeCode: null,
            birthCity: 'Paris',
            birthProvinceCode: null,
            birthCountry: 'France',
            email: 'toto@example.net',
            resultRecipientEmail: null,
            externalId: 'EXT1234',
            birthdate: '28/05/1984',
            extraTimePercentage: 33,
            createdAt: '2021-02-01',
            sessionId: '456',
            userId: '747',
            schoolingRegistrationId: null,
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
