import * as serializer from '../../../../../../../src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer.js';
import { domainBuilder, expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile summaries to JSONAPI with meta data', function () {
      // given
      const targetProfileSummaries = [
        domainBuilder.buildTargetProfileSummaryForAdmin({
          id: 1,
          internalName: 'TPA',
          outdated: false,
          category: 'OTHER',
          createdAt: new Date('2021-01-01'),
          isPartOfCombinedCourse: true,
        }),
        domainBuilder.buildTargetProfileSummaryForAdmin({
          id: 2,
          internalName: 'TPB',
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
              'internal-name': 'TPA',
              outdated: false,
              category: 'OTHER',
              'created-at': new Date('2021-01-01'),
              'is-part-of-combined-course': true,
            },
          },
          {
            type: 'target-profile-summaries',
            id: '2',
            attributes: {
              'internal-name': 'TPB',
              category: 'POUET',
              outdated: true,
              'created-at': new Date('2021-01-01'),
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
