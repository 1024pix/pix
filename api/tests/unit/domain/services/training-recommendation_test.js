const {
  getCappedSkills,
  getCappedKnowledgeElements,
} = require('../../../../lib/domain/services/training-recommendation');
const { expect, domainBuilder } = require('../../../test-helper');

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
});
