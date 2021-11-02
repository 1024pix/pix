const { expect, domainBuilder } = require('../../../../test-helper');
const flash = require('../../../../../lib/domain/services/algorithm-methods/flash');

describe('Integration | Domain | Algorithm-methods | Flash', function () {
  beforeEach(function () {});

  describe('#getPossibleNextChallenge', function () {
    context('when there is no challenge', function () {
      it('should return hasAssessmentEnded as true and possibleChallenges is empty', function () {
        // given
        const challenges = [];

        // when
        const result = flash.getPossibleNextChallenges({ challenges });

        // then
        expect(result).to.deep.equal({ hasAssessmentEnded: true, possibleChallenges: [] });
      });
    });

    context('when there is challenge', function () {
      it('should return hasAssessmentEnded as false and possibleChallenges not empty', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const challenges = [challenge];

        // when
        const result = flash.getPossibleNextChallenges({ challenges });

        // then
        expect(result).to.deep.equal({ hasAssessmentEnded: false, possibleChallenges: [challenge] });
      });

      context('when there is no previous answer', function () {
        it('should return the best next challenge', function () {
          // given
          const worstNextChallenge = domainBuilder.buildChallenge({
            difficulty: -5,
            discriminant: -5,
          });
          const bestNextChallenge = domainBuilder.buildChallenge({
            difficulty: 1,
            discriminant: 5,
          });
          const challenges = [worstNextChallenge, bestNextChallenge];

          // when
          const result = flash.getPossibleNextChallenges({ challenges });

          // then
          expect(result).to.deep.equal({ hasAssessmentEnded: false, possibleChallenges: [bestNextChallenge] });
        });

        it('should return every best next challenge', function () {
          // given
          const worstNextChallenge = domainBuilder.buildChallenge({
            difficulty: -5,
            discriminant: -5,
          });
          const bestNextChallenge = domainBuilder.buildChallenge({
            difficulty: 1,
            discriminant: 5,
          });
          const anotherBestNextChallenge = domainBuilder.buildChallenge({
            difficulty: 1,
            discriminant: 5,
          });
          const challenges = [worstNextChallenge, bestNextChallenge, anotherBestNextChallenge];

          // when
          const result = flash.getPossibleNextChallenges({ challenges });

          // then
          expect(result).to.deep.equal({
            hasAssessmentEnded: false,
            possibleChallenges: [bestNextChallenge, anotherBestNextChallenge],
          });
        });
      });
    });
  });
});
