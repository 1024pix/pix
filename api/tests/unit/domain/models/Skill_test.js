const Skill = require('../../../../lib/domain/models/Skill');
const { expect } = require('../../../test-helper');

describe('Unit | Domain | Models | Skill', () => {

  describe('#get Difficulty', function() {
    it('should return the difficulty of the skill', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.difficulty).to.be.equal(1);
    });
  });

  describe('#get TubeName', function() {
    it('should return the name of the tube', function() {
      // given
      const url1 = new Skill({ name: '@url1' });

      // then
      expect(url1.tubeName).to.be.equal('url');
    });
  });

  describe('#getEasierWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url1 and url3 when requesting skills easier than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const url3 = new Skill({ name: '@url3' });
      const url5 = new Skill({ name: '@url5' });

      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getEasierWithin(tubes)).to.be.deep.equal([url1, url3]);
    });
  });

  describe('#getHarderWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url3 and url5 when requesting skills harder than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const url3 = new Skill({ name: '@url3' });
      const url5 = new Skill({ name: '@url5' });
      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getHarderWithin(tubes)).to.be.deep.equal([url3, url5]);
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

});
