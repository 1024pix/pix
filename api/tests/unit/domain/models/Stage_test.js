const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Stage', () => {

  describe('getMinSkillsCountToReachStage', () => {
    it('should returns the number of skills in order to reach the stage', () => {
      // given
      const stage = domainBuilder.buildStage({ threshold: 20 });

      // when
      const skillsToReach = stage.getMinSkillsCountToReachStage(50);

      // then
      expect(skillsToReach).to.be.equal(10);
    });

    it('should always return a floor integer 7.5 become 7 not 8', () => {
      // given
      const stage = domainBuilder.buildStage({ threshold: 25 });

      // when
      const skillsToReach = stage.getMinSkillsCountToReachStage(30);

      // then
      expect(skillsToReach).to.be.equal(7);
    });

    it('should always return a floor integer 7.25 become 7 not 8', () => {
      // given
      const stage = domainBuilder.buildStage({ threshold: 25 });

      // when
      const skillsToReach = stage.getMinSkillsCountToReachStage(29);

      // then
      expect(skillsToReach).to.be.equal(7);
    });
  });
});
