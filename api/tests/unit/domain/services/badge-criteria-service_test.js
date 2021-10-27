const { domainBuilder, expect } = require('../../../test-helper');

const BadgeCriterion = require('../../../../lib/domain/models/BadgeCriterion');
const badgeCriteriaService = require('../../../../lib/domain/services/badge-criteria-service');
const KnowledgeElement = require('../../../../lib/domain/models/KnowledgeElement');

const CRITERION_THRESHOLD = {
  CAMPAIGN_PARTICIPATION: 70,
  SKILL_SET: 60,
};

const COMPETENCE_RESULT_ID = {
  FIRST: 1,
  SECOND: 2,
};

describe('Unit | Domain | Services | badge-criteria', function () {
  describe('#verifyCriteriaFulfilment', function () {
    context('when there is multiple badge criteria to acquire one badge', function () {
      const badgeCriteria = [
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        domainBuilder.buildBadgeCriterion({
          id: 1,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          threshold: CRITERION_THRESHOLD.CAMPAIGN_PARTICIPATION,
        }),
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        domainBuilder.buildBadgeCriterion({
          id: 2,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          scope: BadgeCriterion.SCOPES.SKILL_SET,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          threshold: CRITERION_THRESHOLD.SKILL_SET,
        }),
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        domainBuilder.buildBadgeCriterion({
          id: 3,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          scope: BadgeCriterion.SCOPES.SKILL_SET,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          threshold: CRITERION_THRESHOLD.SKILL_SET,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          skillSetIds: [COMPETENCE_RESULT_ID.SECOND],
        }),
      ];
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when all the badge criteria are fulfilled', async function () {
        // given
        const masteryPercentage = 90;
        const skillSetResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 90 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 90 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when no badge criterion is fulfilled', async function () {
        // given
        const masteryPercentage = 20;
        const skillSetResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 30 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(false);
      });

      it('should return false when at least one badge criterion is not fulfilled', async function () {
        // given
        const masteryPercentage = 90;
        const skillSetResults = [
          { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 90 },
          { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 30 },
        ];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the CAMPAIGN_PARTICIPATION is the only badge criterion', function () {
      const badgeCriteria = [
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        domainBuilder.buildBadgeCriterion({
          id: 1,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          threshold: CRITERION_THRESHOLD.CAMPAIGN_PARTICIPATION,
        }),
      ];
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return true when fulfilled', async function () {
        // given
        const masteryPercentage = 90;
        const skillSetResults = [];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(true);
      });

      it('should return false when not fulfilled', async function () {
        // given
        const masteryPercentage = 20;
        const skillSetResults = [];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(false);
      });
    });

    context('when the SKILL_SET is the only badge criterion', function () {
      context('when the list of skillSetsIds contains one skillSet', function () {
        const badgeCriteria = [
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          domainBuilder.buildBadgeCriterion({
            id: 1,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            scope: BadgeCriterion.SCOPES.SKILL_SET,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            threshold: CRITERION_THRESHOLD.SKILL_SET,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            skillSetIds: [COMPETENCE_RESULT_ID.SECOND],
          }),
        ];
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        const badge = domainBuilder.buildBadge({ badgeCriteria });

        it('should return true when fulfilled', async function () {
          // given
          const masteryPercentage = 10;
          const skillSetResults = [
            { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
            { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 61 },
          ];

          // when
          const result = await badgeCriteriaService.verifyCriteriaFulfilment({
            masteryPercentage,
            skillSetResults,
            badge,
          });

          // then
          expect(result).to.be.equal(true);
        });

        it('should return false when not fulfilled', async function () {
          const masteryPercentage = 10;
          const skillSetResults = [
            { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 70 },
            { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 50 },
          ];

          // when
          const result = await badgeCriteriaService.verifyCriteriaFulfilment({
            masteryPercentage,
            skillSetResults,
            badge,
          });

          // then
          expect(result).to.be.equal(false);
        });
      });

      context('when the list of skillSetsIds contains more than one', function () {
        const badgeCriteria = [
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line mocha/no-setup-in-describe
          domainBuilder.buildBadgeCriterion({
            id: 1,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            scope: BadgeCriterion.SCOPES.SKILL_SET,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            threshold: CRITERION_THRESHOLD.SKILL_SET,
            // TODO: Fix this the next time the file is edited.
            // eslint-disable-next-line mocha/no-setup-in-describe
            skillSetIds: [COMPETENCE_RESULT_ID.FIRST, COMPETENCE_RESULT_ID.SECOND],
          }),
        ];
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line mocha/no-setup-in-describe
        const badge = domainBuilder.buildBadge({ badgeCriteria });

        it('should return true when fulfilled for all skillSet', async function () {
          // given
          const masteryPercentage = 10;
          const skillSetResults = [
            { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 62 },
            { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 60 },
          ];

          // when
          const result = await badgeCriteriaService.verifyCriteriaFulfilment({
            masteryPercentage,
            skillSetResults,
            badge,
          });

          // then
          expect(result).to.be.equal(true);
        });

        it('should return false when one is not fulfilled', async function () {
          const masteryPercentage = 10;
          const skillSetResults = [
            { id: COMPETENCE_RESULT_ID.FIRST, masteryPercentage: 10 },
            { id: COMPETENCE_RESULT_ID.SECOND, masteryPercentage: 65 },
          ];

          // when
          const result = await badgeCriteriaService.verifyCriteriaFulfilment({
            masteryPercentage,
            skillSetResults,
            badge,
          });

          // then
          expect(result).to.be.equal(false);
        });
      });
    });

    context('when the badge does not have criterion', function () {
      const badgeCriteria = [];
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line mocha/no-setup-in-describe
      const badge = domainBuilder.buildBadge({ badgeCriteria });

      it('should return false', async function () {
        // given
        const masteryPercentage = 90;
        const skillSetResults = [];

        // when
        const result = await badgeCriteriaService.verifyCriteriaFulfilment({
          masteryPercentage,
          skillSetResults,
          badge,
        });

        // then
        expect(result).to.be.equal(false);
      });
    });
  });

  describe('#areBadgeCriteriaFulfilled', function () {
    it('should return false if badge is not acquired', function () {
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
            scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
            threshold: 54,
          }),
        ],
        skillSets: [
          domainBuilder.buildSkillSet({
            id: 18,
            name: 'Yellow',
            color: 'emerald',
            skillIds: [1, 2, 4],
          }),
        ],
        targetProfileId: targetProfile.id,
      });

      // when
      const badgeAcquired = badgeCriteriaService.areBadgeCriteriaFulfilled({
        knowledgeElements,
        targetProfile,
        badge: yellowBadge,
      });

      // then
      expect(badgeAcquired).to.equal(false);
    });

    it('should return true if badge is acquired', function () {
      // given
      const knowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'validated' }),
        new KnowledgeElement({ skillId: 4, status: 'validated' }),
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
            scope: BadgeCriterion.SCOPES.CAMPAIGN_PARTICIPATION,
            threshold: 50,
          }),
          domainBuilder.buildBadgeCriterion({
            id: 17,
            scope: BadgeCriterion.SCOPES.SKILL_SET,
            skillSetIds: [18, 19],
            threshold: 50,
          }),
        ],
        skillSets: [
          domainBuilder.buildSkillSet({
            id: 18,
            name: 'Yellow',
            skillIds: [1, 2],
          }),
          domainBuilder.buildSkillSet({
            id: 18,
            name: 'Darken Yellow',
            skillIds: [3, 4],
          }),
        ],
        targetProfileId: targetProfile.id,
      });

      // when
      const badgeAcquired = badgeCriteriaService.areBadgeCriteriaFulfilled({
        knowledgeElements,
        targetProfile,
        badge: yellowBadge,
      });

      // then
      expect(badgeAcquired).to.equal(true);
    });
  });

  describe('#getMasteryPercentageForAllSkillSets', function () {
    it('should return an empty array when there is no skillSets', function () {
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
        skillSets: [],
        targetProfileId: targetProfile.id,
      });
      const expectedMasteryPercentages = [];

      // when
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForAllSkillSets({
        targetedKnowledgeElements,
        targetProfileSkillsIds,
        badge: yellowBadge,
      });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentages);
    });

    it('should return correct mastery percentages for all skillSets', function () {
      // given
      const targetedKnowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 3, status: 'validated' }),
        new KnowledgeElement({ skillId: 4, status: 'invalidated' }),
        new KnowledgeElement({ skillId: 7, status: 'validated' }),
        new KnowledgeElement({ skillId: 8, status: 'validated' }),
      ];
      const skillsIds = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }];
      const targetProfileSkillsIds = [1, 2, 3, 4, 5];
      const targetProfile = domainBuilder.buildTargetProfile({
        id: 1,
        skills: skillsIds,
      });
      const yellowBadge = domainBuilder.buildBadge({
        id: 1,
        badgeCriteria: [],
        skillSets: [
          domainBuilder.buildSkillSet({
            id: 1,
            skillIds: [1, 2, 3],
          }),
          domainBuilder.buildSkillSet({
            id: 2,
            skillIds: [3, 4, 5],
          }),
          domainBuilder.buildSkillSet({
            id: 3,
            skillIds: [1, 2, 3, 4, 5],
          }),
          domainBuilder.buildSkillSet({
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
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForAllSkillSets({
        targetedKnowledgeElements,
        targetProfileSkillsIds,
        badge: yellowBadge,
      });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentages);
    });
  });

  describe('#getMasteryPercentageForTargetProfile', function () {
    it('should return global mastery percentage', function () {
      // given
      const targetedKnowledgeElements = [
        new KnowledgeElement({ skillId: 1, status: 'validated' }),
        new KnowledgeElement({ skillId: 2, status: 'invalidated' }),
      ];
      const targetProfileSkillsIds = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];

      const expectedMasteryPercentage = 25;

      // when
      const masteryPercentages = badgeCriteriaService.getMasteryPercentageForTargetProfile({
        targetedKnowledgeElements,
        targetProfileSkillsIds,
      });

      // then
      expect(masteryPercentages).to.deep.equal(expectedMasteryPercentage);
    });
  });
});
