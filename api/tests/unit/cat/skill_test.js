const expect = require('chai').expect;
const Skill = require('../../../lib/cat/skill');

describe('Unit | Model | Skill', function() {

  describe('#getEasierWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new Skill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getEasierWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url1 and url3 when requesting skills easier than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill('url1');
      const url3 = new Skill('url3');
      const url5 = new Skill('url5');
      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getEasierWithin(tubes)).to.be.deep.equal([url1, url3]);
    });
  });

  describe('#getHarderWithin()', function() {
    it('should exist', function() {
      // given
      const url1 = new Skill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.exist;
    });

    it('should return the skill itself if it is alone within its tube', function() {
      // given
      const url1 = new Skill('url1');
      const tubes = { 'url': [url1] };

      // then
      expect(url1.getHarderWithin(tubes)).to.be.deep.equal([url1]);
    });

    it('should return url3 and url5 when requesting skills harder than url3 within url1-3-5', function() {
      // given
      const url1 = new Skill('url1');
      const url3 = new Skill('url3');
      const url5 = new Skill('url5');
      const tubes = { 'url': [url1, url3, url5] };

      // then
      expect(url3.getHarderWithin(tubes)).to.be.deep.equal([url3, url5]);
    });
  });
});
