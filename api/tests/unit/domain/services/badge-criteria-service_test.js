const { domainBuilder, expect } = require('../../../test-helper');

const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');

describe('Unit | Domain | Services | badge-criteria', () => {

  describe('#areBadgeCriteriaFulfilled', () => {
    const CAMPAIGN_PARTICIPATION_RESULT_MASTERY_PERCENTAGE = 'La campagne est maîtrisée à X %';
    const CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD = 85;

    const EVERY_COMPETENCE_RESULT_MASTERY_PERCENTAGE = 'Chaque compétence de la campagne est maîtrisée à X %';
    const COMPETENCE_RESULT_THRESHOLD = 75;

    const badgeCriteria = [
      domainBuilder.buildBadgeCriterion({
        id: 1,
        scope: CAMPAIGN_PARTICIPATION_RESULT_MASTERY_PERCENTAGE,
        threshold: CAMPAIGN_PARTICIPATION_RESULT_THRESHOLD
      }),
      domainBuilder.buildBadgeCriterion({
        id: 2,
        scope: EVERY_COMPETENCE_RESULT_MASTERY_PERCENTAGE,
        threshold: COMPETENCE_RESULT_THRESHOLD
      }),
    ];
    const badge = domainBuilder.buildBadge({ badgeCriteria });

    let campaignParticipationResult = {};

    context('when the badge criteria are fulfilled', function() {

      beforeEach(() =>  {
        const partnerCompetenceResults = [
          domainBuilder.buildCompetenceResult({
            id: 1,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
          }),
        ];
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          partnerCompetenceResults: partnerCompetenceResults,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return true', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });

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
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 3,
            totalSkillsCount: 10,
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
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });

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
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 9,
            totalSkillsCount: 10,
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
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });

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
          }),
          domainBuilder.buildCompetenceResult({
            id: 2,
            validatedSkillsCount: 3,
            totalSkillsCount: 10,
          }),
        ];
        campaignParticipationResult = domainBuilder.buildCampaignParticipationResult({
          badge,
          partnerCompetenceResults: partnerCompetenceResults,
          validatedSkillsCount: 9,
          totalSkillsCount: 10,
        });
      });

      it('should return false', async () => {
        // when
        const result = await badgeCriteriaService.areBadgeCriteriaFulfilled({ campaignParticipationResult, badgeCriteria });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });
});
