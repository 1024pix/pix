import { expect } from 'chai';

import { badgeAcquisitionsStatisticsSerializer } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/jsonapi/badge-acquisitions-statistics-serializer.js';

describe('Unit | Serializer | JSONAPI | badge-acquisitions-statistics-serializer', function () {
  describe('#serialize', function () {
    it('should convert badge acquisitions statistics into JSON API data', function () {
      const badge1 = Symbol('badge1');
      const badge2 = Symbol('badge2');

      const json = badgeAcquisitionsStatisticsSerializer.serialize({
        campaignId: 1,
        data: [
          { badge: badge1, percentage: 12, count: 1 },
          { badge: badge2, percentage: 24, count: 2 },
        ],
      });

      expect(json).to.deep.equal({
        data: {
          type: 'badge-acquisitions-statistics',
          id: '1',
          attributes: {
            data: [
              { badge: badge2, percentage: 24, count: 2 },
              { badge: badge1, percentage: 12, count: 1 },
            ],
          },
        },
      });
    });
  });
});
