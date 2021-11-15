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
        const allAnswers = [];

        // when
        const result = flash.getPossibleNextChallenges({ challenges, allAnswers });

        // then
        expect(result).to.deep.equal({ hasAssessmentEnded: true, possibleChallenges: [] });
      });
    });

    context('when there is challenge', function () {
      it('should return hasAssessmentEnded as false and possibleChallenges not empty', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const challenges = [challenge];
        const allAnswers = [];

        // when
        const result = flash.getPossibleNextChallenges({ challenges, allAnswers });

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
          const allAnswers = [];

          // when
          const result = flash.getPossibleNextChallenges({ challenges, allAnswers });

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
          const allAnswers = [];

          // when
          const result = flash.getPossibleNextChallenges({ challenges, allAnswers });

          // then
          expect(result).to.deep.equal({
            hasAssessmentEnded: false,
            possibleChallenges: [bestNextChallenge, anotherBestNextChallenge],
          });
        });
      });
    });
  });

  describe('#getEstimatedLevel', function () {
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
      const challenges = [
        domainBuilder.buildChallenge({
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
        }),
      ];

      const allAnswers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];
      const correctEstimatedLevel = 0.859419960298745;

      // when
      const result = flash.getEstimatedLevel({ allAnswers, challenges });

      // then
      expect(result).to.be.closeTo(correctEstimatedLevel, 0.00000000001);
    });

    it('should return the correct estimatedLevel when there is two answers', function () {
      // given
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'ChallengeFirstAnswers',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
        }),
        domainBuilder.buildChallenge({
          id: 'ChallengeSecondAnswers',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
        }),
      ];

      const allAnswers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[1].id }),
      ];
      const correctEstimatedLevel = 1.802340122865396;

      // when
      const result = flash.getEstimatedLevel({ allAnswers, challenges });

      // then
      expect(result).to.be.closeTo(correctEstimatedLevel, 0.00000000001);
    });

    it('should return the correct estimatedLevel when there is three answers', function () {
      // given
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'ChallengeFirstAnswers',
          discriminant: 1.06665273005823,
          difficulty: -0.030736508016524,
        }),
        domainBuilder.buildChallenge({
          id: 'ChallengeSecondAnswers',
          discriminant: 1.50948587856458,
          difficulty: 1.62670103354638,
        }),
        domainBuilder.buildChallenge({
          id: 'ChallengeThirdAnswers',
          discriminant: 0.950709518595358,
          difficulty: 1.90647729810166,
        }),
      ];

      const allAnswers = [
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[1].id }),
        domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[2].id }),
      ];
      const correctEstimatedLevel = 2.851063556136754;
      // when
      const result = flash.getEstimatedLevel({ allAnswers, challenges });

      // then
      expect(result).to.be.closeTo(correctEstimatedLevel, 0.00000000001);
    });
  });

  describe('#getFilteredChallenges', function() {
    it('should return the same list of challenges if there is no answers', function () {
      // given
      const challenges = [
        domainBuilder.buildChallenge({
          id: 'ChallengeFirstAnswers',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
        }),
        domainBuilder.buildChallenge({
          id: 'ChallengeSecondAnswers',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
        }),
      ];

      const allAnswers = [];

      // when
      const result = flash.getFilteredChallenges({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal(challenges);
    });

    it('should return the list of challenges without already answered skills', function () {
      // given
      const skills = [domainBuilder.buildSkill({ id: 'FirstSkill'}), domainBuilder.buildSkill({ id: 'SecondSkill'})];

      const challenges = [
        domainBuilder.buildChallenge({
          id: 'First',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
          skills: [skills[0]],
        }),
        domainBuilder.buildChallenge({
          id: 'Second',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[0]],
        }),
        domainBuilder.buildChallenge({
          id: 'Third',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[1]],
        }),
      ];

      const allAnswers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];

      // when
      const result = flash.getFilteredChallenges({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal([challenges[2]]);
    });

    it('should return the list of challenges without already answered skills with challenge containing two skills', function () {
      // given
      const skills = [domainBuilder.buildSkill({ id: 'FirstSkill'}), domainBuilder.buildSkill({ id: 'SecondSkill'}), domainBuilder.buildSkill({ id: 'ThirdSkill'})];

      const challenges = [
        domainBuilder.buildChallenge({
          id: 'First',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
          skills: [skills[0], skills[1]],
        }),
        domainBuilder.buildChallenge({
          id: 'Second',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[0]],
        }),
        domainBuilder.buildChallenge({
          id: 'Third',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[1]],
        }),
        domainBuilder.buildChallenge({
          id: 'Fourth',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[2]],
        }),
      ];

      const allAnswers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];

      // when
      const result = flash.getFilteredChallenges({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal([challenges[3]]);
    });

    it('should return the list of challenges without already answered skills with another challenge containing two skills', function () {
      // given
      const skills = [domainBuilder.buildSkill({ id: 'FirstSkill'}), domainBuilder.buildSkill({ id: 'SecondSkill'}), domainBuilder.buildSkill({ id: 'ThirdSkill'})];

      const challenges = [
        domainBuilder.buildChallenge({
          id: 'First',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
          skills: [skills[0]],
        }),
        domainBuilder.buildChallenge({
          id: 'Second',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[1], skills[0]],
        }),
        domainBuilder.buildChallenge({
          id: 'Third',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[1]],
        }),
        domainBuilder.buildChallenge({
          id: 'Fourth',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skills: [skills[2]],
        }),
      ];

      const allAnswers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];

      // when
      const result = flash.getFilteredChallenges({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal([challenges[2], challenges[3]]);
    });

  });
});
