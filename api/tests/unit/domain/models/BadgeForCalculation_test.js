import { expect, domainBuilder } from '../../../test-helper';

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
});
