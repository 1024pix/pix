const { domainBuilder, expect } = require('../../../test-helper');

const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

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

  describe('#verifyCriteriaFulfilment', () => {

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
        const masteryPercentage = 90;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 90 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 90 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when no badge criterion is fulfilled', async () => {
        // given
        const masteryPercentage = 20;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 30 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(false);
      });

      it('should return false when at least one badge criterion is not fulfilled', async () => {
        // given
        const masteryPercentage = 90;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 90 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 30 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

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
        const masteryPercentage = 90;
        const partnerCompetenceResults = [];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {
        // given
        const masteryPercentage = 20;
        const partnerCompetenceResults = [];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

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
        const masteryPercentage = 10;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 40 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 40 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {
        // given
        const masteryPercentage = 10;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 30 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 40 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

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
        const masteryPercentage = 10;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 60 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async () => {

        const masteryPercentage = 10;
        const partnerCompetenceResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 50 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({ masteryPercentage, partnerCompetenceResults, badge });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });

  describe('#areBadgeCriteriaFulfilled', () => {

    it('should return false if badge is not acquired', () => {
      // given
      const knowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 7, status: 'validated' }),
      ];
      const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        skills,
      });
      const yellowBadge = domainBuilder.buildBadge({
        id: 1,
        altMessage: 'You won the Yellow badge',
        imageUrl: '/img/yellow.svg',
        message: 'Congrats, you won the Yellow badge!',
        title: 'Yellow',
        key: 'YELLOW',
        isCertifiable: false,
        badgeCriteria: [
          domainBuilder.buildBadgeCriterion({
            id: 17,
            scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
            threshold: 54,
          }),
        ],
        badgePartnerCompetences: [
          domainBuilder.buildBadgePartnerCompetence({
            id: 18,
            name: 'Yellow',
            color: 'emerald',
            skillIds: [1, 2, 4],
          }),
        ],
        targetProfileId: targetProfile.id,
      });

      // when
      const badgeAcquired = badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge: yellowBadge });

      // then
      expect(badgeAcquired).to.equal(false);
    });

    it('should return true if badge is acquired', () => {
      // given
      const knowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'validated' }),
        new KnowledgeElement({ skillId: 7, status: 'validated' }),
      ];
      const skills = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        skills,
      });
      const yellowBadge = domainBuilder.buildBadge({
        id: 1,
        altMessage: 'You won the Yellow badge',
        imageUrl: '/img/yellow.svg',
        message: 'Congrats, you won the Yellow badge!',
        title: 'Yellow',
        key: 'YELLOW',
        isCertifiable: false,
        badgeCriteria: [
          domainBuilder.buildBadgeCriterion({
            id: 17,
            scope: BadgeCriterion.SCOPES.EVERY_PARTNER_COMPETENCE,
            threshold: 54,
          }),
        ],
        badgePartnerCompetences: [
          domainBuilder.buildBadgePartnerCompetence({
            id: 18,
            name: 'Yellow',
            color: 'emerald',
            skillIds: [1, 2, 4],
          }),
        ],
        targetProfileId: targetProfile.id,
      });

      // when
      const badgeAcquired = badgeCriteriaService.areBadgeCriteriaFulfilled({ knowledgeElements, targetProfile, badge: yellowBadge });

      // then
      expect(badgeAcquired).to.equal(true);
    });
  });

  describe('#getMasteryPercentageForAllPartnerCompetences', () => {

    it('should return an empty array when there is not badgePartnerCompetences', () => {
      // given
      const targetedKnowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 7, status: 'validated' }),
      ];
      const targetProfileSkillsIds = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        skills: targetProfileSkillsIds,
      });
      const yellowBadge = domainBuilder.buildBadge({
        id: 1,
        badgeCriteria: [],
        badgePartnerCompetences: [],
        targetProfileId: targetProfile.id,
      });
      const expectedMasteryPercentages = [];

      // when
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForAllPartnerCompetences({ targetedKnowledgeElements, targetProfileSkillsIds, badge: yellowBadge });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentages);
    });

    it('should return correct mastery percentages for all badgePartnerCompetences', () => {
      // given
      const targetedKnowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 3, status: 'validated' }),
        new KnowledgeElement({ skillId: 4, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 7, status: 'validated' }),
        new KnowledgeElement({ skillId: 8, status: 'validated' }),
      ];
      const skillsIds = [
        { id: 1 },
        { id: 2 },
        { id: 3 },
        { id: 4 },
        { id: 5 },
      ];
      const targetProfileSkillsIds = [1, 2, 3, 4, 5];
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        skills: skillsIds,
      });
      const yellowBadge = domainBuilder.buildBadge({
        id: 1,
        badgeCriteria: [],
        badgePartnerCompetences: [
          domainBuilder.buildBadgePartnerCompetence({
            id: 1,
            skillIds: [1, 2, 3],
          }),
          domainBuilder.buildBadgePartnerCompetence({
            id: 2,
            skillIds: [3, 4, 5],
          }),
          domainBuilder.buildBadgePartnerCompetence({
            id: 3,
            skillIds: [1, 2, 3, 4, 5],
          }),
          domainBuilder.buildBadgePartnerCompetence({
            id: 4,
            skillIds: [1, 2, 7],
          }),
        ],
        targetProfileId: targetProfile.id,
      });
      const expectedMasteryPercentages = [
        { id: 1, masteryPercentage: 67 },
        { id: 2, masteryPercentage: 33 },
        { id: 3, masteryPercentage: 40 },
        { id: 4, masteryPercentage: 50 },
      ];
      // when
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForAllPartnerCompetences({ targetedKnowledgeElements, targetProfileSkillsIds, badge: yellowBadge });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentages);
    });
  });

  describe('#getMasteryPercentageForTargetProfile', () => {

    it('should return global mastery percentage', () => {
      // given
      const targetedKnowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
      ];
      const targetProfileSkillsIds = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

      const expectedMasteryPercentage = 25;

      // when
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForTargetProfile({ targetedKnowledgeElements, targetProfileSkillsIds });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentage);
    });
  });

});
