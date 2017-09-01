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
      const web4 = new Skill('web', 4);
      const web5 = new Skill('web', 5);
      const url1 = new Skill('url', 1);
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

    it('should return a dictionary of tubes when some challenges require multiple skills', function() {
      // given
      const web4 = new Skill('web', 4);
      const web5 = new Skill('web', 5);
      const url1 = new Skill('url', 1);
      const url2 = new Skill('url', 2);
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
      const web1 = new Skill('web', 1);
      const web4 = new Skill('web', 4);
      const web5 = new Skill('web', 5);
      const url1 = new Skill('url', 1);
      const url2 = new Skill('url', 2);
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
});
