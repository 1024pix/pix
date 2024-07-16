import { Course } from '../../../../../src/shared/domain/models/Course.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Domain | Models | Course', function () {
  describe('#nbChallenges', function () {
    it('should return the number of challenges', function () {
      // given
      const challenges = ['firstChallenge', 'secondChallenge'];
      const course = new Course({ challenges });

      // when
      const result = course.nbChallenges;

      // then
      expect(result).to.equal(2);
    });
  });
});
