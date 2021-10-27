const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/session-for-supervising-serializer');

describe('Unit | Serializer | JSONAPI | session-for-supervising-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a SessionForSupervising model object into JSON API data', function () {
      // given
      const expectedPayload = {
        data: {
          type: 'sessionForSupervisings',
          id: '12',
          attributes: {
            room: '28D',
            date: '2017-01-20',
            time: '14:30',
            'certification-center-name': 'Toto',
            examiner: 'Antoine Toutvenant',
            'certification-candidates': [
              {
                id: 1234,
                'first-name': 'toto',
                'last-name': 'tata',
                birthdate: '28/05/1984',
                'extra-time-percentage': null,
              },
            ],
          },
        },
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
            extraTimePercentage: null,
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
