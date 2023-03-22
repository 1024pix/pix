const { getCappedSkills } = require('../../../../lib/domain/services/training-recommendation');
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
});
