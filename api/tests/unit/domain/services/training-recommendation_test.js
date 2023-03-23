const {
  getCappedSkills,
  getCappedKnowledgeElements,
  getValidatedKnowledgeElementsCount,
  getValidatedKnowledgeElementsPercentage,
} = require('../../../../lib/domain/services/training-recommendation');
const { expect, domainBuilder } = require('../../../test-helper');
const { KnowledgeElement } = require('../../../../lib/domain/models');
const _ = require('lodash');

describe('Unit | Service | Training Recommendation', function () {
  describe('#getCappedSkills', function () {
    it('should return capped skills for given tube level', function () {
      // given
      const skillLevel1 = domainBuilder.buildSkill({ id: 'recSkill1', difficulty: 1 });
      const skillLevel2 = domainBuilder.buildSkill({ id: 'recSkill2', difficulty: 2 });
      const skillLevel3 = domainBuilder.buildSkill({ id: 'recSkill3', difficulty: 3 });

      const skills = [skillLevel3, skillLevel2, skillLevel1];
      const cappedLevel = 2;

      // when
      const cappedSkills = getCappedSkills({ skills, cappedLevel });

      // then
      expect(cappedSkills).to.deep.equal([skillLevel2, skillLevel1]);
    });

    it('should return empty array when no skills corresponds for given tube level', function () {
      // given
      const skillLevel2 = domainBuilder.buildSkill({ id: 'recSkill2', difficulty: 2 });
      const skillLevel3 = domainBuilder.buildSkill({ id: 'recSkill3', difficulty: 3 });

      const skills = [skillLevel3, skillLevel2];
      const cappedLevel = 1;

      // when
      const cappedSkills = getCappedSkills({ skills, cappedLevel });

      // then
      expect(cappedSkills).to.be.empty;
    });
  });

  describe('#getCappedKnowledgeElements', function () {
    it('should return capped knowledge elements for given capped skills', function () {
      // given
      const skillLevel1 = domainBuilder.buildSkill({ id: 'recSkill1', difficulty: 1 });
      const skillLevel2 = domainBuilder.buildSkill({ id: 'recSkill2', difficulty: 2 });

      const cappedSkills = [skillLevel1, skillLevel2];

      const knowledgeElement1 = domainBuilder.buildKnowledgeElement({ skillId: skillLevel1.id });
      const knowledgeElement2 = domainBuilder.buildKnowledgeElement({ skillId: skillLevel2.id });
      const knowledgeElement3 = domainBuilder.buildKnowledgeElement({ skillId: 'anotherSkillId' });

      const knowledgeElements = [knowledgeElement1, knowledgeElement2, knowledgeElement3];

      // when
      const cappedKnowledgeElements = getCappedKnowledgeElements({ knowledgeElements, cappedSkills });

      // then
      expect(cappedKnowledgeElements).to.deep.equal([knowledgeElement1, knowledgeElement2]);
    });

    it('should return empty array when no knowledge elements corresponds for given capped skills', function () {
      // given
      const skillLevel1 = domainBuilder.buildSkill({ id: 'recSkill1', difficulty: 1 });
      const skillLevel2 = domainBuilder.buildSkill({ id: 'recSkill2', difficulty: 2 });

      const cappedSkills = [skillLevel1, skillLevel2];

      const knowledgeElement3 = domainBuilder.buildKnowledgeElement({ skillId: 'anotherSkillId' });

      const knowledgeElements = [knowledgeElement3];

      // when
      const cappedKnowledgeElements = getCappedKnowledgeElements({ knowledgeElements, cappedSkills });

      // then
      expect(cappedKnowledgeElements).to.be.empty;
    });
  });

  describe('#getValidatedKnowledgeElementsCount', function () {
    it('should return count of validated knowledge elements for given knowledge elements', function () {
      // given
      const knowledgeElementValidated1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
      });
      const knowledgeElementValidated2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.VALIDATED,
      });
      const knowledgeElementInvalidated = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });

      const knowledgeElements = [knowledgeElementValidated1, knowledgeElementValidated2, knowledgeElementInvalidated];

      // when
      const validatedKnowledgeElementsCount = getValidatedKnowledgeElementsCount({ knowledgeElements });

      // then
      expect(validatedKnowledgeElementsCount).to.equal(2);
    });

    it('should return 0 when no validated knowledge elements corresponds for given knowledge elements', function () {
      // given
      const knowledgeElementInvalidated1 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });
      const knowledgeElementInvalidated2 = domainBuilder.buildKnowledgeElement({
        status: KnowledgeElement.StatusType.INVALIDATED,
      });

      const knowledgeElements = [knowledgeElementInvalidated1, knowledgeElementInvalidated2];

      // when
      const validatedKnowledgeElementsCount = getValidatedKnowledgeElementsCount({ knowledgeElements });

      // then
      expect(validatedKnowledgeElementsCount).to.equal(0);
    });
  });

  describe('#getValidatedKnowledgeElementsPercentage', function () {
    const testCases = [
      {
        validatedKnowledgeElementsCount: 0,
        invalidatedKnowledgeElementsCount: 0,
        expectedPercentage: 0,
      },
      {
        validatedKnowledgeElementsCount: 1,
        invalidatedKnowledgeElementsCount: 1,
        expectedPercentage: 50,
      },
      {
        validatedKnowledgeElementsCount: 2,
        invalidatedKnowledgeElementsCount: 1,
        expectedPercentage: 67,
      },
      {
        validatedKnowledgeElementsCount: 1,
        invalidatedKnowledgeElementsCount: 2,
        expectedPercentage: 33,
      },
    ];

    // eslint-disable-next-line mocha/no-setup-in-describe
    testCases.forEach(({ validatedKnowledgeElementsCount, invalidatedKnowledgeElementsCount, expectedPercentage }) => {
      it(`should return ${expectedPercentage} percentage of validated knowledge elements for given knowledge elements`, function () {
        // given
        const validatedKnowledgeElements = _.times(validatedKnowledgeElementsCount, () =>
          domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.VALIDATED,
          })
        );

        const invalidatedKnowledgeElements = _.times(invalidatedKnowledgeElementsCount, () =>
          domainBuilder.buildKnowledgeElement({
            status: KnowledgeElement.StatusType.INVALIDATED,
          })
        );

        const knowledgeElements = [...validatedKnowledgeElements, ...invalidatedKnowledgeElements];

        // when
        const validatedKnowledgeElementsPercentage = getValidatedKnowledgeElementsPercentage({ knowledgeElements });

        // then
        expect(validatedKnowledgeElementsPercentage).to.equal(expectedPercentage);
      });
    });
  });
});
