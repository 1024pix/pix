import { domainBuilder, expect } from '../../../test-helper.js';

describe('Unit | Domain | Models | BadgeForCalculation', function () {
  describe('#shouldBeObtained', function () {
    context('when there are several criteria', function () {
      let knowledgeElements;
      beforeEach(function () {
        knowledgeElements = [
          domainBuilder.buildKnowledgeElement.directlyValidated({ skillId: 'recSkill1' }),
          domainBuilder.buildKnowledgeElement.directlyValidated({ skillId: 'recSkill2' }),
          domainBuilder.buildKnowledgeElement.directlyInvalidated({ skillId: 'recSkill3' }),
          domainBuilder.buildKnowledgeElement.directlyValidated({ skillId: 'recSkill4' }),
          domainBuilder.buildKnowledgeElement.directlyValidated({ skillId: 'recSkill5' }),
          domainBuilder.buildKnowledgeElement.directlyInvalidated({ skillId: 'recSkill6' }),
          domainBuilder.buildKnowledgeElement.directlyInvalidated({ skillId: 'recSkill7' }),
        ];
      });

      it('should be obtained when all criteria are fulfilled', async function () {
        // given
        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 50,
          skillIds: ['recSkill1', 'recSkill3'],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: ['recSkill2', 'recSkill6', 'recSkill7'],
        });
        const badgeForCalculation = domainBuilder.buildBadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const shouldBeObtained = badgeForCalculation.shouldBeObtained(knowledgeElements);

        // then
        expect(shouldBeObtained).to.be.true;
      });

      it('should not be obtained when some criteria are not fulfilled', async function () {
        // given
        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 100,
          skillIds: ['recSkill1', 'recSkill3'],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 70,
          skillIds: ['recSkill2', 'recSkill6', 'recSkill7'],
        });
        const badgeForCalculation = domainBuilder.buildBadgeForCalculation({
          badgeCriteriaa: [criteria1, criteria2],
        });

        // when
        const shouldBeObtained = badgeForCalculation.shouldBeObtained(knowledgeElements);

        // then
        expect(shouldBeObtained).to.be.false;
      });
    });
  });

  describe('#getAcquisitionPercentage', function () {
    context('when badge criteria are all fulfilled', function () {
      it('should return 100', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: true },
          { skillId: 2, isValidated: false },
          { skillId: 3, isValidated: true },
          { skillId: 4, isValidated: false },
        ];

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 50,
          skillIds: [1, 2],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [3, 4],
        });
        const badgeForCalculation = domainBuilder.buildBadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(100);
      });
    });

    context('when badge criteria are not all fulfilled', function () {
      it('should return the right acquisition percentage', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: true },
          { skillId: 2, isValidated: false },
          { skillId: 3, isValidated: true },
          { skillId: 4, isValidated: false },
        ];

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 60,
          skillIds: [1, 2],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [3, 4],
        });
        const badgeForCalculation = domainBuilder.buildBadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(92);
      });
    });

    context('when no badge criteria are fulfilled', function () {
      it('should return 0', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: false },
          { skillId: 2, isValidated: false },
        ];

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 60,
          skillIds: [1],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [2],
        });
        const badgeForCalculation = domainBuilder.buildBadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(0);
      });
    });
  });
});
