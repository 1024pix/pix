const { expect, domainBuilder } = require('../../../test-helper');

describe('Unit | Domain | Models | Target-Profile/TargetedSkill', () => {

  describe('get#difficulty', () => {
    it('should return the difficulty of the skill', function() {
      // given
      const url1 = domainBuilder.buildTargetedSkill({ name: '@url1' });

      // then
      expect(url1.difficulty).to.be.equal(1);
    });
  });
});
