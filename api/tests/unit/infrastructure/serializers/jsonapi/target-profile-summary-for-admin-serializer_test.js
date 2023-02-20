import { expect, domainBuilder } from '../../../../test-helper';
import serializer from '../../../../../lib/infrastructure/serializers/jsonapi/target-profile-summary-for-admin-serializer';

describe('Unit | Serializer | JSONAPI | target-profile-serializer', function () {
  describe('#serialize', function () {
    it('should serialize target profile summaries to JSONAPI with meta data', function () {
      // given
      const targetProfileSummaries = [
        domainBuilder.buildTargetProfileSummaryForAdmin({ id: 1, name: 'TPA', outdated: false }),
        domainBuilder.buildTargetProfileSummaryForAdmin({ id: 2, name: 'TPB', outdated: true }),
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
            },
          },
          {
            type: 'target-profile-summaries',
            id: '2',
            attributes: {
              name: 'TPB',
              outdated: true,
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
