import { expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/campaign-participations-count-by-stage-serializer.js';

describe('Unit | Serializer | JSONAPI | campaign-participations-count-by-stage-serializer', function () {
  describe('#serialize', function () {
    it('should convert a participations count by stage model object into JSON API data', function () {
      const json = serializer.serialize({
        campaignId: 1,
        data: [
          { id: 'stage1', value: 0, title: 'title1', description: 'description1' },
          { id: 'stage2', value: 1, title: 'title2', description: 'description2' },
        ],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'campaign-participations-count-by-stages',
          id: '1',
          attributes: {
            data: [
              { id: 'stage1', value: 0, title: 'title1', description: 'description1' },
              { id: 'stage2', value: 1, title: 'title2', description: 'description2' },
            ],
          },
        },
      });
    });
  });
});
