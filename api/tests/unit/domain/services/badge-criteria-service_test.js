const { domainBuilder, expect } = require('../../../test-helper');

const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

const CRITERION_THRESHOLD = {
  CAMPAIGN_PARTICIPATION: 70,
  EVERY_PARTNER_COMPETENCE: 40,
  SOME_PARTNER_COMPETENCES: 60,
};

const COMPETENCE_RESULT_ID = {
  FIRST: 1,
  SECOND: 2,
};

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#areBadgeCriteriaFulfilled', () => {

    context('when there is multiple badge criteria to acquire one badge', function() {
      const badgeCriteria = [
        domainBuilder.buildBadgeCriterion({
          id: 1,
          scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
          threshold: CRITERION_THRESHOLD.CAMPAIGN_PARTICIPATION,
        }),
        domainBuilder.buildBadgeCriterion({
          id: 2,
          scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
          threshold: CRITERION_THRESHOLD.EVERY_PARTNER_COMPETENCE,
        }),
        domainBuilder.buildBadgeCriterion({
          id: 3,
          scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
          threshold: CRITERION_THRESHOLD.SOME_PARTNER_COMPETENCES,
          partnerCompetenceIds: [COMPETENCE_RESULT_ID.SECOND],
        }),
      ];
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when all the badge criteria are fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 9,
          secondCompetenceResult: 9,
          campaignParticipationResult: 9,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when no badge criterion is fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 1,
          secondCompetenceResult: 3,
          campaignParticipationResult: 2,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });

      it('should return false when at least one badge criterion is not fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 9,
          secondCompetenceResult: 3,
          campaignParticipationResult: 9,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });

    });

    context('when the CAMPAIGN_PARTICIPATION is the only badge criterion', function() {
      const badgeCriteria = [
        domainBuilder.buildBadgeCriterion({
          id: 1,
          scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
          threshold: CRITERION_THRESHOLD.CAMPAIGN_PARTICIPATION,
        }),
      ];
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 1,
          secondCompetenceResult: 1,
          campaignParticipationResult: 9,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 1,
          secondCompetenceResult: 1,
          campaignParticipationResult: 2,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the EVERY_PARTNER_COMPETENCE is the only badge criterion', function() {
      const badgeCriteria = [
        domainBuilder.buildBadgeCriterion({
          id: 1,
          scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
          threshold: CRITERION_THRESHOLD.EVERY_PARTNER_COMPETENCE,
        }),
      ];

      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 4,
          secondCompetenceResult: 4,
          campaignParticipationResult: 1,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 3,
          secondCompetenceResult: 4,
          campaignParticipationResult: 1,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the SOME_PARTNER_COMPETENCES is the only badge criterion', function() {
      const badgeCriteria = [
        domainBuilder.buildBadgeCriterion({
          id: 1,
          scope: BadgeCriterion.SCOPES.SOME_PARTNER_COMPETENCES,
          threshold: CRITERION_THRESHOLD.SOME_PARTNER_COMPETENCES,
          partnerCompetenceIds: [COMPETENCE_RESULT_ID.SECOND],
        }),
      ];
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 1,
          secondCompetenceResult: 6,
          campaignParticipationResult: 1,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {
        // given
        const validatedSkillsCount = {
          firstCompetenceResult: 1,
          secondCompetenceResult: 5,
          campaignParticipationResult: 1,
        };
        const campaignParticipationResult = _buildCampaignParticipationResult(validatedSkillsCount, badge);

        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});

function _buildCampaignParticipationResult(validatedSkillsCount, badge) {
  const partnerCompetenceResults = [
    domainBuilder.buildCompetenceResult({
      id: COMPETENCE_RESULT_ID.FIRST,
      validatedSkillsCount: validatedSkillsCount.firstCompetenceResult,
      totalSkillsCount: 10,
      badgeId: badge.id,
    }),
    domainBuilder.buildCompetenceResult({
      id: COMPETENCE_RESULT_ID.SECOND,
      validatedSkillsCount: validatedSkillsCount.secondCompetenceResult,
      totalSkillsCount: 10,
      badgeId: badge.id,
    }),
  ];

  const campaignParticipationBadge = domainBuilder.buildCampaignParticipationBadge({
    id: badge.id,
    partnerCompetenceResults,
  });

  return domainBuilder.buildCampaignParticipationResult({
    campaignParticipationBadges: [campaignParticipationBadge],
    validatedSkillsCount: validatedSkillsCount.campaignParticipationResult,
    totalSkillsCount: 10,
  });
}
