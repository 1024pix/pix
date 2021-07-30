const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-participant-activity-serializer');
const CampaignParticipantActivity = require('../../../../../lib/domain/read-models/CampaignParticipantActivity');
const Assessment = require('../../../../../lib/domain/models/Assessment');

describe('Unit | Serializer | JSONAPI | campaign-participant-activity-serializer', function() {

  describe('#serialize()', function() {

    it('should call serialize method by destructuring passed parameter', function() {
      // given
      const campaignParticipantsActivities = [
        new CampaignParticipantActivity({
          userId: 1,
          campaignParticipationId: '1',
          firstName: 'Karam',
          lastName: 'Habibi',
          participantExternalId: 'Dev',
          isShared: true,
          assessmentState: Assessment.states.COMPLETED,
        }),
        new CampaignParticipantActivity({
          userId: 2,
          campaignParticipationId: '2',
          firstName: 'Dimitri',
          lastName: 'Payet',
          participantExternalId: 'Footballer',
          sharedAt: null,
          assessmentState: Assessment.states.STARTED,
        }),
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
              status: CampaignParticipantActivity.statuses.SHARED,
            },
          },
          {
            type: 'campaign-participant-activities',
            id: '2',
            attributes: {
              'first-name': 'Dimitri',
              'last-name': 'Payet',
              'participant-external-id': 'Footballer',
              status: CampaignParticipantActivity.statuses.STARTED,
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
