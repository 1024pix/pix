import { trainingSummarySerializer } from '../../../../../../src/devcomp/infrastructure/serializers/jsonapi/training-summary-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | training-summary-serializer', function () {
  describe('#serialize', function () {
    it('should serialize training summaries to JSONAPI with meta data', function () {
      // given
      const trainingSummaries = [
        domainBuilder.buildTrainingSummary({
          id: 1,
          title: 'Training Summary 1',
          internalTitle: 'Training Summary 1 internal title',
          targetProfilesCount: 1,
          prerequisiteThreshold: 2,
          goalThreshold: 30,
        }),
        domainBuilder.buildTrainingSummary({
          id: 2,
          title: 'Training Summary 2',
          internalTitle: 'Training Summary 2 internal title',
        }),
      ];
      const meta = { pagination: { page: 1, pageSize: 3, pageCount: 1, rowCount: 2 } };

      // when
      const serializedTrainingSummaries = trainingSummarySerializer.serialize(trainingSummaries, meta);

      // then
      expect(serializedTrainingSummaries).to.deep.equal({
        data: [
          {
            type: 'training-summaries',
            id: '1',
            attributes: {
              'goal-threshold': 30,
              'prerequisite-threshold': 2,
              'target-profiles-count': 1,
              title: 'Training Summary 1',
              'internal-title': 'Training Summary 1 internal title',
              'is-disabled': false,
            },
          },
          {
            type: 'training-summaries',
            id: '2',
            attributes: {
              'goal-threshold': undefined,
              'prerequisite-threshold': undefined,
              'target-profiles-count': 0,
              title: 'Training Summary 2',
              'internal-title': 'Training Summary 2 internal title',
              'is-disabled': false,
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
