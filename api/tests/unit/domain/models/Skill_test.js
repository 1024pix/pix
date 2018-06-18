const Skill = require('../../../../lib/domain/models/Skill');
const { expect, factory } = require('../../../test-helper');

describe('Unit | Domain | Models | Skill', () => {

  describe('#Difficulty', function() {
    it('should return the difficulty of the skill', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.difficulty).to.be.equal(1);
    });
  });

  describe('#TubeName', function() {
    it('should return the name of the tube', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.tubeName).to.be.equal('url');
    });
  });

  describe('#computePixScore()', function() {

    it('should return the pixScore gained by the skill', function() {
      // given
      const skillNames = ['@web1', '@chi1', '@fou1', '@mis1', '@web3', '@url3', '@web4', '@chi5', '@fou5', '@mis5'];
      const competenceSkills = skillNames.map(skillName => new Skill({ name: skillName }));
      const skillWeb1 = new Skill({ name: '@web1' });
      const skillWeb3 = new Skill({ name: '@web3' });
      const skillWeb4 = new Skill({ name: '@web4' });
      const skillChi5 = new Skill({ name: '@chi5' });

      // when
      const pixScoreWeb1 = skillWeb1.computePixScore(competenceSkills);
      const pixScoreWeb3 = skillWeb3.computePixScore(competenceSkills);
      const pixScoreWeb4 = skillWeb4.computePixScore(competenceSkills);
      const pixScoreChi5 = skillChi5.computePixScore(competenceSkills);

      // then
      expect(pixScoreWeb1).to.equal(2);
      expect(pixScoreWeb3).to.equal(4);
      expect(pixScoreWeb4).to.equal(4);
      expect(pixScoreChi5).to.equal(2.6666666666666665);

    });

  });

  describe('#tubeNameWithAt', () => {
    it('should have a property fromListOfSkill', () => {
      // when
      const skill = new Skill({ name: '@web3' });

      // then
      expect(skill.tubeNameWithAt).to.equal('@web');
    });
  });

  describe('#areEqual()', function() {
    it('should return false when two skills are not the same', () => {
      // given
      const [skill1, skill2] = factory.buildSkillCollection();
      // when
      const result = Skill.areEqual(skill1, skill2);
      // then
      expect(result).to.be.false;
    });

    it('should return true if two skills have the same name', () => {
      // given
      const skill = factory.buildSkill({ name:'@skill1' });
      const otherSkill = factory.buildSkill({ name:'@skill1' });
      // when
      const result = Skill.areEqual(skill, otherSkill);
      // then
      expect(result).to.be.true;
    });

    it('should return false if either argument is undefined', () => {
      // given
      const skill = factory.buildSkill({ name:'@skill1' });
      const otherSkill = undefined;
      // when
      const result1 = Skill.areEqual(skill, otherSkill);
      const result2 = Skill.areEqual(otherSkill, skill);
      // then
      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });
  });
});
