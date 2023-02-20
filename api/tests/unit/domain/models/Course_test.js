import { expect } from '../../../test-helper';
import Course from '../../../../lib/domain/models/Course';

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
