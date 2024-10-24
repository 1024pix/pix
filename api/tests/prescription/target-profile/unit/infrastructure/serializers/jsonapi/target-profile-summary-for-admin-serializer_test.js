import * as serializer from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile summaries to JSONAPI with meta data', function () {
      // given
      const targetProfileSummaries = [
        domainBuilder.buildTargetProfileSummaryForAdmin({
          id: 1,
          name: 'TPA',
          outdated: false,
          category: 'OTHER',
          createdAt: new Date('2021-01-01'),
        }),
        domainBuilder.buildTargetProfileSummaryForAdmin({
          id: 2,
          name: 'TPB',
          category: 'POUET',
          outdated: true,
          createdAt: new Date('2021-01-01'),
        }),
      ];
      const meta = { page: 1, pageSize: 3, pageCount: 1, rowCount: 2 };

      // when
      const serializedTargetProfileSummaries = serializer.serialize(targetProfileSummaries, meta);

      // then
      expect(serializedTargetProfileSummaries).to.deep.equal({
        data: [
          {
            type: 'target-profile-summaries',
            id: '1',
            attributes: {
              name: 'TPA',
              outdated: false,
              category: 'OTHER',
              'created-at': new Date('2021-01-01'),
              'can-detach': false,
            },
          },
          {
            type: 'target-profile-summaries',
            id: '2',
            attributes: {
              name: 'TPB',
              category: 'POUET',
              outdated: true,
              'created-at': new Date('2021-01-01'),
              'can-detach': false,
            },
          },
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 3,
          rowCount: 2,
        },
      });
    });
  });
});
