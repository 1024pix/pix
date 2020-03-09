const { domainBuilder, expect } = require('../../../test-helper');

const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#areBadgeCriteriaFulfilled', () => {
    const badge = domainBuilder.buildBadge();

    let campaignParticipationResult = {};

    context('when the badge criteria are fulfilled', function() {

      beforeEach(() =>  {
        const badge = domainBuilder.buildBadge();
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({ masteryPercentage: 94, badge });
      });

      it('should return true', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(true);
      });
    });

    context('when the badge criteria are not fulfilled', function() {
      beforeEach(() =>  {
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({ masteryPercentage: 24, badge });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});
