import { expect } from '../../../../../../test-helper.js';
import * as serializer from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/campaign-profiles-collection-participation-summary-serializer.js';
import { CampaignProfilesCollectionParticipationSummary } from '../../../../../../../src/prescription/campaign/domain/read-models/CampaignProfilesCollectionParticipationSummary.js';

describe('Unit | Serializer | JSONAPI | campaign-profiles-collection-participation-summary-serializer', function () {
  describe('#serialize', function () {
    it('should return a serialized JSON data object', function () {
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
            certifiable: true,
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
