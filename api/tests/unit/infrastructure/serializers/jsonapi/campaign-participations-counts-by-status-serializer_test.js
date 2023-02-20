import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participations-counts-by-status-serializer';

describe('Unit | Serializer | JSONAPI | campaign-participations-counts-by-status-serializer', function () {
  describe('#serialize', function () {
    it('should convert a participations count by stage model object into JSON API data', function () {
      const json = serializer.serialize({
        campaignId: 1,
        started: 1,
        completed: 1,
        shared: 1,
      });

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-participations-counts-by-statuses',
          id: '1',
          attributes: {
            started: 1,
            completed: 1,
            shared: 1,
          },
        },
      });
    });
  });
});
