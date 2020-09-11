const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer');
const CampaignProfilesCollectionParticipationSummary = require('../../../../../lib/domain/read-models/CampaignProfilesCollectionParticipationSummary');

describe('Unit | Serializer | JSONAPI | campaign-profiles-collection-participation-summary-serializer', () => {
  describe('#serialize', () => {
    it('should return a serialized JSON data object', () => {
      const meta = { some: 'meta' };
      const participationSummary = new CampaignProfilesCollectionParticipationSummary({
        campaignParticipationId: '1',
        firstName: 'Antoine',
        lastName: 'Boidelo',
        participantExternalId: 'abo',
        sharedAt: new Date(2020, 2, 2),
        pixScore: 1024,
        certifiable: true,
        certifiableCompetencesCount: 8,
      });

      const expectedSerializedResult = {
        data: {
          id: '1',
          type: 'CampaignProfilesCollectionParticipationSummaries',
          attributes: {
            'first-name': 'Antoine',
            'last-name': 'Boidelo',
            'participant-external-id': 'abo',
            'shared-at': new Date(2020, 2, 2),
            'pix-score': 1024,
            'certifiable': true,
            'certifiable-competences-count': 8,
          },
        },
        meta,
      };

      // when
      const result = serializer.serialize({ data: participationSummary, pagination: meta });

      // then
      expect(result).to.deep.equal(expectedSerializedResult);
    });
  });
});
