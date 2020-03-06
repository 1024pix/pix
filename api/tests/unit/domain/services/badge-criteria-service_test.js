const { domainBuilder, expect } = require('../../../test-helper');

const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#reviewBadgeCriteria', () => {
    const badge = domainBuilder.buildBadge();

    let campaignParticipationResult = {};

    context('when the badge criteria are validated', function() {

      beforeEach(() =>  {
        const badge = domainBuilder.buildBadge();
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({ masteryPercentage: 94, badge });
      });

      it('should return true', async () => {
        // when
        const result = await badgeCriteriaService.reviewBadgeCriteria({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(true);
      });
    });

    context('when the badge criteria are not validated', function() {
      beforeEach(() =>  {
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({ masteryPercentage: 24, badge });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.reviewBadgeCriteria({ campaignParticipationResult });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});
