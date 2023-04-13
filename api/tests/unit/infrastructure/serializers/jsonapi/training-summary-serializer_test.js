const { expect, domainBuilder } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/training-summary-serializer');

describe('Unit | Serializer | JSONAPI | training-summary-serializer', function () {
  describe('#serialize', function () {
    it('should serialize training summaries to JSONAPI with meta data', function () {
      // given
      const trainingSummaries = [
        domainBuilder.buildTrainingSummary({ id: 1, title: 'Training Summary 1', isRecommendable: true }),
        domainBuilder.buildTrainingSummary({ id: 2, title: 'Training Summary 2' }),
      ];
      const meta = { pagination: { page: 1, pageSize: 3, pageCount: 1, rowCount: 2 } };

      // when
      const serializedTrainingSummaries = serializer.serialize(trainingSummaries, meta);

      // then
      expect(serializedTrainingSummaries).to.deep.equal({
        data: [
          {
            type: 'training-summaries',
            id: '1',
            attributes: {
              title: 'Training Summary 1',
              'is-recommendable': true,
            },
          },
          {
            type: 'training-summaries',
            id: '2',
            attributes: {
              title: 'Training Summary 2',
              'is-recommendable': false,
            },
          },
        ],
        meta: {
          pagination: {
            page: 1,
            pageCount: 1,
            pageSize: 3,
            rowCount: 2,
          },
        },
      });
    });
  });
});
