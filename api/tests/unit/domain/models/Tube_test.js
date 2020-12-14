const Tube = require('../../../../lib/domain/models/Tube');
const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Tube', () => {

  describe('#constructor', () => {
    it('should accept a list of skills as parameter', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@web2' })];

      // when
      const tube = new Tube({ skills });

      // then
      expect(tube.skills).to.equal(skills);
    });

    it('should have a name from skills', () => {
      // given
      const skills = [new Skill({ name: '@web3' }), new Skill({ name: '@web2' })];

      // when
      const tube = new Tube({ skills });

      // then
      expect(tube.name).to.equal('web');
    });

    it('should have a name from constructor', () => {
      // given
      const skills = [new Skill({ name: '@web3' })];

      // when
      const tube = new Tube({ skills, name: 'tubeName' });

      // then
      expect(tube.name).to.equal('tubeName');
    });

    it('should not have a name when skills list is empty and name is not provided', () => {
      // when
      const tube = new Tube();

      // then
      expect(tube.name).to.equal('');
    });

    it('should create the tube without skills', () => {
      // when
      const tube = new Tube({});

      // then
      expect(tube.name).to.equal('');
    });

  });

  describe('#getEasierThan()', () => {

    it('should return the skill itself if it is alone within its tube', () => {
      // given
      const skill = new Skill({ name: '@url1' });
      const skills = [skill];
      const tube = new Tube({ skills });

      // when
      const easierSkills = tube.getEasierThan(skill);

      // then
      expect(easierSkills).to.be.deep.equal(skills);
    });

    it('should return url1 and url3 when requesting skills easier than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const url3 = new Skill({ name: '@url3' });
      const url5 = new Skill({ name: '@url5' });
      const skills = [url1, url3, url5];
      const tube = new Tube({ skills });

      // when
      const easierSkills = tube.getEasierThan(url3);

      // then
      expect(easierSkills).to.be.deep.equal([url1, url3]);
    });
  });

  describe('#getHarderThan()', () => {

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const skill = new Skill({ name: '@url1' });
      const skills = [skill];
      const tube = new Tube({ skills });

      // when
      const easierSkills = tube.getHarderThan(skill);

      // then
      expect(easierSkills).to.be.deep.equal(skills);
    });

    it('should return url3 and url5 when requesting skills harder than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const url3 = new Skill({ name: '@url3' });
      const url5 = new Skill({ name: '@url5' });
      const skills = [url1, url3, url5];
      const tube = new Tube({ skills });

      // when
      const easierSkills = tube.getHarderThan(url3);

      // then
      expect(easierSkills).to.be.deep.equal([url3, url5]);
    });
  });

  describe('#addSkill()', () => {
    it('should add skill to the list of skills', () => {
      // given
      const skillWeb1 = new Skill({ name: '@web1' });
      const skillWeb2 = new Skill({ name: '@web2' });
      const tube = new Tube({ skills: [skillWeb1] });

      // when
      tube.addSkill(skillWeb2);

      // then
      expect(tube.skills).to.be.deep.equal([skillWeb1, skillWeb2]);
    });

    it('should not add skill if skill is already present to the list of skills', () => {
      // given
      const skillWeb1 = new Skill({ name: '@web1' });
      const tube = new Tube({ skills: [skillWeb1] });

      // when
      tube.addSkill(skillWeb1);

      // then
      expect(tube.skills).to.be.deep.equal([skillWeb1]);

    });
  });

});
