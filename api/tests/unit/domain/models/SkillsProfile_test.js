const TargetProfile = require('../../../../lib/domain/models/TargetProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetProfile', () => {

  describe('#constructor', () => {
    it('should accept a list of skills as parameter', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@url1' })];

      // when
      const targetProfile = new TargetProfile({ skills });

      // then
      expect(targetProfile.skills).to.equal(skills);
    });
  });

  describe('#fromListOfSkill', () => {
    it('should have a property fromListOfSkill', () => {
      // given
      const skills = [new Skill({ name: '@web1' })];

      // when
      const targetProfile = TargetProfile.fromListOfSkill(skills);

      // then
      expect(targetProfile).to.be.an.instanceOf(TargetProfile);
      expect(targetProfile.skills).to.deep.equal(skills);
    });

    it('should complete targeted skills with all easier skills', () => {
      // given
      const skills = [new Skill({ name: '@web2' })];
      const expectedTargetProfile = new TargetProfile({ skills: [new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const targetProfile = TargetProfile.fromListOfSkill(skills);

      // then
      expect(targetProfile).to.be.an.instanceOf(TargetProfile);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should not generate duplicate skills', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@web2' })];
      const expectedTargetProfile = new TargetProfile({ skills: [new Skill({ name: '@web3' }), new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const targetProfile = TargetProfile.fromListOfSkill(skills);

      // then
      expect(targetProfile).to.be.an.instanceOf(TargetProfile);
      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

  });

});
