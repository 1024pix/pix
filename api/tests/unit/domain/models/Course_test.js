const { expect } = require('../../../test-helper');
const Course = require('../../../../lib/domain/models/Course');

describe('Unit | Domain | Models | Course', () => {

  describe('#nbChallenges', () => {

    it('should return the number of challenges', () => {
      // given
      const challenges = [
        'firstChallenge',
        'secondChallenge',
      ];
      const course = new Course({ challenges });

      // when
      const result = course.nbChallenges;

      // then
      expect(result).to.equal(2);
    });
  });
});
