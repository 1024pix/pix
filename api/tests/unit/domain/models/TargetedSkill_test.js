const TargetedSkill = require('../../../../lib/domain/models/TargetedSkill');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | TargetedSkill', () => {

  describe('#constructor', () => {
    it('should accept a list of skills as parameter', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@url1' })];

      // when
      const targetedSkills = new TargetedSkill({ skills });

      // then
      expect(targetedSkills.skills).to.equal(skills);
    });
  });

  describe('#fromListOfSkill', () => {
    it('should have a property fromListOfSkill', () => {
      // given
      const skills = [new Skill({ name: '@web1' })];

      // when
      const targetedSkills = TargetedSkill.fromListOfSkill(skills);

      // then
      expect(targetedSkills).to.be.an.instanceOf(TargetedSkill);
      expect(targetedSkills.skills).to.deep.equal(skills);
    });

    it('should complete targeted skills with all easier skills', () => {
      // given
      const skills = [new Skill({ name: '@web2' })];
      const expectedTargetedSkill = new TargetedSkill({ skills: [new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const targetedSkills = TargetedSkill.fromListOfSkill(skills);

      // then
      expect(targetedSkills).to.be.an.instanceOf(TargetedSkill);
      expect(targetedSkills).to.deep.equal(expectedTargetedSkill);
    });

    it('should not generate duplicate skills', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@web2' })];
      const expectedTargetedSkill = new TargetedSkill({ skills: [new Skill({ name: '@web3' }), new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const targetedSkills = TargetedSkill.fromListOfSkill(skills);

      // then
      expect(targetedSkills).to.be.an.instanceOf(TargetedSkill);
      expect(targetedSkills).to.deep.equal(expectedTargetedSkill);
    });

  });

});
