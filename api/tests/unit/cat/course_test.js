const expect = require('chai').expect;
const Course = require('../../../lib/cat/course');
const Skill = require('../../../lib/cat/skill');
const Challenge = require('../../../lib/cat/challenge');

describe('Unit | Model | Course', function() {

  describe('#tubes', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);

      // then
      expect(course.tubes).to.exist;
    });

    it('should return a dictionary of tubes when all challenges require only one skill', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const ch1 = new Challenge('a', 'validé', [web4]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [url1]);
      const challenges = [ch1, ch2, ch3];
      const course = new Course(challenges);

      // when
      const tubes = course.tubes;

      // then
      const expectedTubes = { 'web': [web4, web5], 'url': [url1] };
      expect(tubes).to.deep.equal(expectedTubes);
    });

    it('should not add the same skill twice in a tube', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const ch1 = new Challenge('a', 'validé', [url1]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [web4]);
      const ch4 = new Challenge('d', 'validé', [web4]);
      const challenges = [ch1, ch2, ch3, ch4];
      const course = new Course(challenges);

      // when
      const tubes = course.tubes;

      // then
      const expectedTubes = { 'web': [web4, web5], 'url': [url1] };
      expect(tubes).to.deep.equal(expectedTubes);
    });

    it('should return a dictionary of tubes when some challenges require multiple skills', function() {
      // given
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const url2 = new Skill('url2');
      const ch1 = new Challenge('a', 'validé', [web4, url1]);
      const ch2 = new Challenge('b', 'validé', [web5]);
      const ch3 = new Challenge('c', 'validé', [url2]);
      const challenges = [ch1, ch2, ch3];
      const course = new Course(challenges);

      // when
      const tubes = course.tubes;

      // then
      const expectedTubes = { 'web': [web4, web5], 'url': [url1, url2] };
      expect(tubes).to.deep.equal(expectedTubes);
    });

    it('should return a dictionary of tubes which difficulties are ordered by value', function() {
      // given
      const web1 = new Skill('web1');
      const web4 = new Skill('web4');
      const web5 = new Skill('web5');
      const url1 = new Skill('url1');
      const url2 = new Skill('url2');
      const ch1 = new Challenge('a', 'validé', [web5, url2]);
      const ch2 = new Challenge('b', 'validé', [web4, url1, web1]);
      const challenges = [ch1, ch2];
      const course = new Course(challenges);

      // when
      const tubes = course.tubes;

      // then
      const expectedTubes = { 'web': [web1, web4, web5], 'url': [url1, url2] };
      expect(tubes).to.deep.equal(expectedTubes);
    });
  });

  describe('#computePixScoreOfSkills()', function() {
    it('should exist', function() {
      // given
      const course = new Course([]);

      // then
      expect(course.computePixScoreOfSkills).to.exist;
    });

    it('should return a mapping defined for each skill', function() {
      // given
      const skillNames = ['web1', 'chi1', 'fou1', 'mis1', 'web3', 'url3', 'web4', 'chi5', 'fou5', 'mis5'];
      const competenceSkills = skillNames.map(skillName => new Skill(skillName));
      const course = new Course([], competenceSkills);

      // when
      const pixScoreOfSkills = course.computePixScoreOfSkills();

      // then
      expect(pixScoreOfSkills.length).to.equal(competenceSkills.size);
      competenceSkills.forEach(skill => {
        expect(pixScoreOfSkills[skill.name]).to.not.equal(undefined);
      });
    });

    it('should return a mapping between skills and pix scores', function() {
      // given
      const skillNames = ['web1', 'chi1', 'fou1', 'mis1', 'web3', 'url3', 'web4', 'chi5', 'fou5', 'mis5'];
      const competenceSkills = skillNames.map(skillName => new Skill(skillName));

      const course = new Course([], competenceSkills);

      // when
      const pixScoreOfSkills = course.computePixScoreOfSkills();

      // then
      const expectedPixScoresByLevel = { 1: 2, 3: 4, 4: 4, 5: 2.6666666666666665 };
      competenceSkills.forEach(skill => {
        expect(pixScoreOfSkills[skill.name]).to.equal(expectedPixScoresByLevel[skill.difficulty]);
      });
    });

    it('the pix score of each skill should be 4 at most', function() {
      // given
      const skillNames = ['web1', 'chi1', 'fou1', 'mis1', 'web3', 'url3', 'web4', 'chi5', 'fou5', 'mis5'];
      const competenceSkills = skillNames.map(skillName => new Skill(skillName));
      const course = new Course([], competenceSkills);

      // when
      const pixScoreOfSkills = course.computePixScoreOfSkills();

      // then
      competenceSkills.forEach(skill => {
        expect(pixScoreOfSkills[skill.name]).to.be.at.most(4);
      });
    });
  });
});
