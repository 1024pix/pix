const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-profiles-collection-participant-summaries-serializer');
const CampaignProfilesCollectionParticipantSummary = require('../../../../../lib/domain/models/CampaignProfilesCollectionParticipantSummary');

describe('Unit | Serializer | JSONAPI | campaign-profiles-collection-participant-summaries-serializer', () => {
  describe('#serialize', () => {
    it('should return a serialized JSON data object', () => {
      const participantSummaries = new CampaignProfilesCollectionParticipantSummary({
        campaignParticipationId: '1',
        firstName: 'Antoine',
        lastName: 'Boidelo',
        participantExternalId: 'abo',
        sharedAt: new Date(2020, 2, 2),
      });

      const expectedSerializedResult = {
        data: {
          id: '1',
          type: 'campaignProfilesCollectionParticipantSummaries',
          attributes: {
            'first-name': 'Antoine',
            'last-name': 'Boidelo',
            'participant-external-id': 'abo',
            'shared-at': new Date(2020, 2, 2),
          },
        }
      };

      // when
      const result = serializer.serialize(participantSummaries);

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
