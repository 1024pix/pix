import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participations-counts-by-day-serializer';

describe('Unit | Serializer | JSONAPI | campaign-participations-counts-by-day-serializer', function () {
  describe('#serialize', function () {
    it('should convert a participations count by day object into JSON API data', function () {
      const json = serializer.serialize({
        campaignId: 1,
        startedParticipations: [{ day: '2021-06-01', count: 1 }],
        sharedParticipations: [{ day: '2021-06-01', count: 1 }],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-participations-counts-by-days',
          id: '1',
          attributes: {
            'started-participations': [{ day: '2021-06-01', count: 1 }],
            'shared-participations': [{ day: '2021-06-01', count: 1 }],
          },
        },
      });
    });
  });
});
