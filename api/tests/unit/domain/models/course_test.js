const { describe, it, expect } = require('../../../test-helper');
const Challenge = require('../../../../lib/domain/models/Challenge');
const Course = require('../../../../lib/domain/models/Course');

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
});
