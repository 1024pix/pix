const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');
const Skill = require('../../../../lib/domain/models/Skill');

describe('Unit | Domain | Models | Course', () => {

  describe('#constructor', () => {

    it('should set @challenges relationships property to empty array by default', () => {
      // given
      const course = new Course({});

      // when
      const result = course.challenges;

      // then
      expect(result).to.exist;
      expect(result).to.have.lengthOf(0);
    });

    it('should set @challenges relationships property to the one given in params', () => {
      // given
      const challenges = [
        new Challenge(),
        new Challenge(),
        new Challenge(),
      ];
      const course = new Course({ challenges });

      // when
      const result = course.challenges;

      // then
      expect(result).to.deep.equal(challenges);
    });
  });

  describe('#getTubes', function() {
    it('should return a dictionary of tubes when all challenges require only one skill', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web4, web5, url1];
      const course = new Course();

      // when
      const tubes = course.getTubes(listSkills);

      // then
      const expectedTubes = { 'web': [web4, web5], 'url': [url1] };
      expect(tubes).to.deep.equal(expectedTubes);
    });

    it('should not add the same skill twice in a tube', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web5, web4, url1, url1];

      const course = new Course();

      // when
      const tubes = course.getTubes(listSkills);
      // then
      const expectedTubes = { 'web': [web4, web5], 'url': [url1] };
      expect(tubes).to.deep.equal(expectedTubes);
    });

  });

});
