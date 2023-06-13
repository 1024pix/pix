import { expect } from '../../../test-helper.js';
import { BadgeCriterionForCalculation } from '../../../../lib/domain/models/BadgeCriterionForCalculation.js';

describe('Unit | Domain | Models | BadgeCriterionForCalculation', function () {
  describe('#getAcquisitionPercentage', function () {
    context('when enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return 100', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: true },
          { skillId: 2, isValidated: true },
          { skillId: 3, isValidated: false },
          { skillId: 4 },
        ];
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 60 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(100);
      });
    });

    context('when not enough knowledge elements are valid to fulfill the criterion', function () {
      it('should return badge criterion acquisition percentage', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: true },
          { skillId: 2, isValidated: true },
          { skillId: 3, isValidated: false },
          { skillId: 4 },
        ];
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(84);
      });
    });

    context('when no knowledge elements are valid to fulfill the criterion', function () {
      it('should return 0', function () {
        // given
        const knowledgeElements = [
          { skillId: 1, isValidated: false },
          { skillId: 2, isValidated: false },
          { skillId: 3, isValidated: false },
          { skillId: 4 },
        ];
        const skillIds = [1, 2, 3];
        const badgeCriterion = new BadgeCriterionForCalculation({ skillIds, threshold: 80 });

        // when
        const acquisitionPercentage = badgeCriterion.getAcquisitionPercentage(knowledgeElements);

        // then
        expect(acquisitionPercentage).to.equal(0);
      });
    });
  });
});
