import { expect } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/participations-count-by-mastery-rate';

describe('Unit | Serializer | JSONAPI | participations-count-by-mastery-rate', function () {
  describe('#serialize', function () {
    it('should convert a campaign result distribution object into JSON API data', function () {
      const json = serializer.serialize({
        campaignId: 1,
        resultDistribution: [
          { count: 1, masteryRate: '0.50' },
          { count: 2, masteryRate: '1.00' },
        ],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'participations-count-by-mastery-rates',
          id: '1',
          attributes: {
            'result-distribution': [
              { count: 1, masteryRate: '0.50' },
              { count: 2, masteryRate: '1.00' },
            ],
          },
        },
      });
    });
  });
});
