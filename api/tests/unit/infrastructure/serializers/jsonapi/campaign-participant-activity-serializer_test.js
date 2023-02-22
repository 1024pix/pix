import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participant-activity-serializer';
import CampaignParticipantActivity from '../../../../../lib/domain/read-models/CampaignParticipantActivity';
import CampaignParticipationStatuses from '../../../../../lib/domain/models/CampaignParticipationStatuses';

const { SHARED, STARTED } = CampaignParticipationStatuses;

describe('Unit | Serializer | JSONAPI | campaign-participant-activity-serializer', function () {
  describe('#serialize()', function () {
    it('should call serialize method by destructuring passed parameter', function () {
      // given
      const campaignParticipantsActivities = [
        new CampaignParticipantActivity({
          userId: 1,
          campaignParticipationId: '1',
          firstName: 'Karam',
          lastName: 'Habibi',
          participantExternalId: 'Dev',
          status: SHARED,
        }),
        new CampaignParticipantActivity({
          userId: 2,
          campaignParticipationId: '2',
          firstName: 'Dimitri',
          lastName: 'Payet',
          participantExternalId: 'Footballer',
          status: STARTED,
          sharedAt: null,
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
              status: SHARED,
            },
          },
          {
            type: 'campaign-participant-activities',
            id: '2',
            attributes: {
              'first-name': 'Dimitri',
              'last-name': 'Payet',
              'participant-external-id': 'Footballer',
              status: STARTED,
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
