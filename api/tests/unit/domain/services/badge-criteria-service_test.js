const { domainBuilder, expect } = require('../../../test-helper');

const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

const CRITERION_THRESHOLD = {
  CAMPAIGN_PARTICIPATION: 85,
  EVERY_PARTNER_COMPETENCE: 75
};

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#areBadgeCriteriaFulfilled', () => {

    const badgeCriteria = [
      domainBuilder.buildBadgeCriterion({
        id: 1,
        scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
        threshold: CRITERION_THRESHOLD.CAMPAIGN_PARTICIPATION
      }),
      domainBuilder.buildBadgeCriterion({
        id: 2,
        scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
        threshold: CRITERION_THRESHOLD.EVERY_PARTNER_COMPETENCE
      }),
    ];
    const badge = domainBuilder.buildBadge({ id: 33, badgeCriteria });

    let campaignParticipationResult = {};

    context('when the badge criteria are fulfilled', function() {

      beforeEach(() =>  {
        const partnerCompetenceResults = [
          domainBuilder.buildCompetenceResult({
            id: 1,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
        ];
        const campaignParticipationBadge = domainBuilder.buildCampaignParticipationBadge({
          id: badge.id,
          isAcquired: true,
          partnerCompetenceResults: partnerCompetenceResults
        });
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          campaignParticipationBadges: [campaignParticipationBadge],
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return true', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(true);
      });
    });

    context('when no badge criteria are fulfilled', function() {
      beforeEach(() =>  {
        const partnerCompetenceResults = [
          domainBuilder.buildCompetenceResult({
            id: 1,
            validatedSkillsCount: 1,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 3,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
        ];
        const campaignParticipationBadge = domainBuilder.buildCampaignParticipationBadge({
          id: badge.id,
          isAcquired: true,
          partnerCompetenceResults: partnerCompetenceResults
        });
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          campaignParticipationBadges: [campaignParticipationBadge],
          validatedSkillsCount: 2,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the campaignParticipationResult badge criterion is not fulfilled', function() {
      beforeEach(() =>  {
        const partnerCompetenceResults = [
          domainBuilder.buildCompetenceResult({
            id: 1,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
        ];
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          partnerCompetenceResults: partnerCompetenceResults,
          validatedSkillsCount: 2,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when one competenceResult badge criterion is not fulfilled', function() {
      beforeEach(() =>  {
        const partnerCompetenceResults = [
          domainBuilder.buildCompetenceResult({
            id: 1,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 3,
            totalSkillsCount: 10,
            badgeId: badge.id,
          }),
        ];
        const campaignParticipationBadge = domainBuilder.buildCampaignParticipationBadge({
          id: badge.id,
          isAcquired: false,
          partnerCompetenceResults: partnerCompetenceResults
        });
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          campaignParticipationBadges: [campaignParticipationBadge],
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});
