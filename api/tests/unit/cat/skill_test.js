const { expect, factory } = require('../../test-helper');
const CatSkill = require('../../../lib/cat/skill');

describe('Unit | Model | Skill', function() {

  describe('#getEasierWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new CatSkill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new CatSkill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url1 and url3 when requesting skills easier than url3 within url1-3-5', function() {
      // given
      const url1 = new CatSkill('url1');
      const url3 = new CatSkill('url3');
      const url5 = new CatSkill('url5');
      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getEasierWithin(tubes)).to.be.deep.equal([url1, url3]);
    });
  });

  describe('#getHarderWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new CatSkill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new CatSkill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url3 and url5 when requesting skills harder than url3 within url1-3-5', function() {
      // given
      const url1 = new CatSkill('url1');
      const url3 = new CatSkill('url3');
      const url5 = new CatSkill('url5');
      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getHarderWithin(tubes)).to.be.deep.equal([url3, url5]);
    });
  });

  describe('#areEqual()', function() {
    it('should return false when two skills are not the same', () => {
      // given
      const [skill1, skill2] = factory.buildCatTube();
      // when
      const result = CatSkill.areEqual(skill1, skill2);
      // then
      expect(result).to.be.false;
    });

    it('should return true if two skills have the same name', () => {
      // given
      const skill = new CatSkill('@skill1');
      const otherSkill = new CatSkill('@skill1');
      // when
      const result = CatSkill.areEqual(skill, otherSkill);
      // then
      expect(result).to.be.true;
    });

    it('should return false if either argument is undefined', () => {
      // given
      const skill = new CatSkill('@skill1');
      const otherSkill = undefined;
      // when
      const result1 = CatSkill.areEqual(skill, otherSkill);
      const result2 = CatSkill.areEqual(otherSkill, skill);
      // then
      expect(result1).to.be.false;
      expect(result2).to.be.false;
    });
  });
});
