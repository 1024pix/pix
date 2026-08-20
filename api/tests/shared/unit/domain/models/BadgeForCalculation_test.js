import { BadgeForCalculation } from '../../../../../src/shared/domain/models/BadgeForCalculation.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | BadgeForCalculation', function () {
  describe('#shouldBeObtained', function () {
    context('when there are several criteria', function () {
      let knowledgeState;

      beforeEach(function () {
        knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: ['recSkill1', 'recSkill2', 'recSkill4', 'recSkill5'],
          invalidatedSkillIds: ['recSkill3', 'recSkill6', 'recSkill7'],
        });
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
        const badgeForCalculation = new BadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const shouldBeObtained = badgeForCalculation.shouldBeObtained(knowledgeState);

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
        const badgeForCalculation = new BadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const shouldBeObtained = badgeForCalculation.shouldBeObtained(knowledgeState);

        // then
        expect(shouldBeObtained).to.be.false;
      });
    });
  });

  describe('#getAcquisitionPercentage', function () {
    context('when badge criteria are all fulfilled', function () {
      it('should return 100', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 3],
          invalidatedSkillIds: [2, 4],
        });

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 50,
          skillIds: [1, 2],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [3, 4],
        });
        const badgeForCalculation = new BadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(100);
      });
    });

    context('when badge criteria are not all fulfilled', function () {
      it('should return the right acquisition percentage', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 3],
          invalidatedSkillIds: [2, 4],
        });

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 60,
          skillIds: [1, 2],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [3, 4],
        });
        const badgeForCalculation = new BadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(92);
      });
    });

    context('when no badge criteria are fulfilled', function () {
      it('should return 0', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          invalidatedSkillIds: [1, 2],
        });

        const criteria1 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 60,
          skillIds: [1],
        });
        const criteria2 = domainBuilder.buildBadgeCriterionForCalculation({
          threshold: 30,
          skillIds: [2],
        });
        const badgeForCalculation = new BadgeForCalculation({
          badgeCriteria: [criteria1, criteria2],
        });

        // when
        const acquisitionPercentage = badgeForCalculation.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(0);
      });
    });
  });
});
