const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participant-activity-serializer');

describe('Unit | Serializer | JSONAPI | campaign-participant-activity-serializer', function() {

  describe('#serialize()', function() {

    it('should call serialize method by destructuring passed parameter', function() {
      // given
      const campaignParticipantsActivities = [
        {
          campaignParticipationId: '1',
          firstName: 'Karam',
          lastName: 'Habibi',
          participantExternalId: 'Dev',
          status: 'COMPLETED',
        },
        {
          campaignParticipationId: '2',
          firstName: 'Dimitri',
          lastName: 'Payet',
          participantExternalId: 'Footballer',
          progression: 0.6,
          status: 'ONGOING',
        },
      ];
      const pagination = {
        page: {
          number: 1,
          pageSize: 2,
        },
      };

      const resultsSerialized = serializer.serialize({ campaignParticipantsActivities, pagination });

      expect(resultsSerialized).to.deep.equal({
        data: [
          {
            type: 'campaign-participant-activities',
            id: '1',
            attributes: {
              'first-name': 'Karam',
              'last-name': 'Habibi',
              'participant-external-id': 'Dev',
              status: 'COMPLETED',
            },
          },
          {
            type: 'campaign-participant-activities',
            id: '2',
            attributes: {
              'first-name': 'Dimitri',
              'last-name': 'Payet',
              'participant-external-id': 'Footballer',
              'progression': 0.6,
              status: 'ONGOING',
            },
          },
        ],
        meta: {
          page: {
            number: 1,
            pageSize: 2,
          },
        },
      });
    });
  });
});
