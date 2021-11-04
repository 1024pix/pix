const { expect, domainBuilder } = require('../../../../test-helper');
const flash = require('../../../../../lib/domain/services/algorithm-methods/flash');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');

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

  describe('#getEstimatedLevel', function() {
    it('should return 0 when there is no answers', function () {
      // given
      const allAnswers = [];

      // when
      const result = flash.getEstimatedLevel({ allAnswers });

      // then
      expect(result).to.equal(0);
    });

    it('should return the correct estimatedLevel when there is one answer', function () {
      // given
      const challenges = [ domainBuilder.buildChallenge({
        discriminant: 1.86350005965093,
        difficulty: 0.194712138508747
      })]

      const allAnswers = [ domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];
      const correctEstimatedLevel = 0.859419960298745;

      // when
      const result = flash.getEstimatedLevel({ allAnswers, challenges });

      // then
      expect(result).to.equal(correctEstimatedLevel);
    });

    it('should return the correct estimatedLevel when there is two answers', function () {
      // given
      const challenges = [
        domainBuilder.buildChallenge({
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747}),
        domainBuilder.buildChallenge({
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319}),
      ]

      const allAnswers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[1].id })
      ];
      const correctEstimatedLevel = 1.802340122865396;

      // when
      const result = flash.getEstimatedLevel({ allAnswers, challenges });

      // then
      expect(result).to.equal(correctEstimatedLevel);
    });

  });

});
