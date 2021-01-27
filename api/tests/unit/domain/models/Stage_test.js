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

    it('should always return an integer', () => {
      // given
      const stage = domainBuilder.buildStage({ threshold: 33 });

      // when
      const skillsToReach = stage.getMinSkillsCountToReachStage(25);

      // then
      expect(skillsToReach).to.be.equal(9);
    });
  });
});
