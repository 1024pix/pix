const SkillsProfile = require('../../../../lib/domain/models/SkillsProfile');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | SkillsProfile', () => {

  describe('#constructor', () => {
    it('should accept a list of skills as parameter', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@url1' })];

      // when
      const skillsProfile = new SkillsProfile({ skills });

      // then
      expect(skillsProfile.skills).to.equal(skills);
    });
  });

  describe('#fromListOfSkill', () => {
    it('should have a property fromListOfSkill', () => {
      // given
      const skills = [new Skill({ name: '@web1' })];

      // when
      const skillsProfile = SkillsProfile.fromListOfSkill(skills);

      // then
      expect(skillsProfile).to.be.an.instanceOf(SkillsProfile);
      expect(skillsProfile.skills).to.deep.equal(skills);
    });

    it('should complete targeted skills with all easier skills', () => {
      // given
      const skills = [new Skill({ name: '@web2' })];
      const expectedSkillsProfile = new SkillsProfile({ skills: [new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const skillsProfile = SkillsProfile.fromListOfSkill(skills);

      // then
      expect(skillsProfile).to.be.an.instanceOf(SkillsProfile);
      expect(skillsProfile).to.deep.equal(expectedSkillsProfile);
    });

    it('should not generate duplicate skills', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@web2' })];
      const expectedSkillsProfile = new SkillsProfile({ skills: [new Skill({ name: '@web3' }), new Skill({ name: '@web2' }), new Skill({ name: '@web1' })] });

      // when
      const skillsProfile = SkillsProfile.fromListOfSkill(skills);

      // then
      expect(skillsProfile).to.be.an.instanceOf(SkillsProfile);
      expect(skillsProfile).to.deep.equal(expectedSkillsProfile);
    });

  });

});
