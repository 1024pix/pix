import CampaignStages from '../../../../../lib/domain/read-models/campaign/CampaignStages';
import { expect, domainBuilder } from '../../../../test-helper';

describe('Unit | Domain | Read Models | CampaignStages', function () {
  describe('#stageThresholdBoundaries', function () {
    it('should return stage Threshold Boundaries', function () {
      // given
      const campaignStages = new CampaignStages({
        stages: [
          domainBuilder.buildStage({
            id: 3,
            threshold: 75,
          }),
          domainBuilder.buildStage({
            id: 1,
            threshold: 10,
          }),
          domainBuilder.buildStage({
            id: 2,
            threshold: 46,
          }),
        ],
      });

      const expected = [
        {
          id: 1,
          from: 10,
          to: 45,
        },
        {
          id: 2,
          from: 46,
          to: 74,
        },
        {
          id: 3,
          from: 75,
          to: 100,
        },
      ];

      // when
      const result = campaignStages.stageThresholdBoundaries;

      // then
      expect(result).to.deep.equal(expected);
    });
  });
});
