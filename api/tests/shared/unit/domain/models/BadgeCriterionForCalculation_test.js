import { BadgeCriterionForCalculation } from '../../../../../src/shared/domain/models/BadgeCriterionForCalculation.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Domain | Models | BadgeCriterionForCalculation', function () {
  describe('#getAcquisitionPercentage', function () {
    context('when enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return 100', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 2],
          invalidatedSkillIds: [3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 60 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(100);
      });
    });

    context('when not enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return badge criterion acquisition percentage', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 2],
          invalidatedSkillIds: [3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(83);
      });
    });

    context('when no knowledge elements are valid to fulfill the criterion', function () {
      it('should return 0', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          invalidatedSkillIds: [1, 2, 3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeState);

        // then
        expect(acquisitionPercentage).to.equal(0);
      });
    });
  });

  describe('#isFulfilled', function () {
    context('when enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return true', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 2],
          invalidatedSkillIds: [3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 60 });

        // when
        const isFulfilled = badgeCriterion.isFulfilled(knowledgeState);

        // then
        expect(isFulfilled).to.be.true;
      });
    });

    context('when not enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return false', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          validatedSkillIds: [1, 2],
          invalidatedSkillIds: [3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const isFulfilled = badgeCriterion.isFulfilled(knowledgeState);

        // then
        expect(isFulfilled).to.be.false;
      });
    });

    context('when no knowledge elements are valid to fulfill the criterion', function () {
      it('should return false', function () {
        // given
        const knowledgeState = domainBuilder.buildKnowledgeState.forSkills({
          invalidatedSkillIds: [1, 2, 3],
        });
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const isFulfilled = badgeCriterion.isFulfilled(knowledgeState);

        // then
        expect(isFulfilled).to.be.false;
      });
    });
  });
});
