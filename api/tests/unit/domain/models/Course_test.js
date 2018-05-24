const { expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Competence = require('../../../../lib/domain/models/Competence');
const Course = require('../../../../lib/domain/models/Course');
const Skill = require('../../../../lib/domain/models/Skill');
const Tube = require('../../../../lib/domain/models/Tube');

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
        Challenge.fromAttributes(),
        Challenge.fromAttributes(),
        Challenge.fromAttributes(),
      ];
      const course = new Course({ challenges });

      // when
      const result = course.challenges;

      // then
      expect(result).to.deep.equal(challenges);
    });

    it('should set @competences relationships property to empty array by default', () => {
      // given
      const course = new Course({});

      // when
      const result = course.competences;

      // then
      expect(result).to.exist;
      expect(result).to.have.lengthOf(0);
    });

    it('should set @competences relationships property to the one given in params', () => {
      // given
      const competences = [
        new Competence(),
        new Competence(),
        new Competence(),
      ];
      const course = new Course({ competences });

      // when
      const result = course.competences;

      // then
      expect(result).to.deep.equal(competences);
    });
  });

  describe('#nbChallenges', () => {

    it('should return the number of challenges', () => {
      // given
      const challenges = [
        new Challenge(),
        new Challenge()
      ];
      const course = new Course({ challenges });

      // when
      const result = course.nbChallenges;

      // then
      expect(result).to.equal(2);
    });
  });

  describe('#computeTubes', function() {
    it('should return an array of tubes when all challenges require only one skill', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web4, web5, url1];
      const course = new Course();
      const tubeWeb = new Tube({ skills: [web4, web5] });
      const tubeUrl = new Tube({ skills: [url1] });

      // when
      course.computeTubes(listSkills);

      // then
      const expectedTubes = [tubeWeb, tubeUrl];
      expect(course.tubes).to.deep.equal(expectedTubes);
    });

    it('should not add the same skill twice in a tube', function() {
      // given
      const web4 = new Skill({ name: '@web4' });
      const web5 = new Skill({ name: '@web5' });
      const url1 = new Skill({ name: '@url1' });
      const listSkills = [web5, web4, url1, url1];
      const course = new Course();
      const tubeWeb = new Tube({ skills: [web4, web5] });
      const tubeUrl = new Tube({ skills: [url1] });

      // when
      course.computeTubes(listSkills);

      // then
      const expectedTubes = [tubeWeb, tubeUrl];
      expect(course.tubes).to.deep.equal(expectedTubes);
    });

  });

  describe('#findTube', function() {
    it('should return the tube with the required name', function() {
      // given
      const url1 = new Skill({ name: '@url1' });
      const course = new Course();
      const tubeUrl = new Tube({ skills: [url1] });
      course.tubes = [tubeUrl];

      // when
      const tube = course.findTube('url');

      // then
      expect(tube).to.deep.equal(tubeUrl);
    });
  });
});
