const { expect, domainBuilder } = require('../../../../test-helper');
const flash = require('../../../../../lib/domain/services/algorithm-methods/flash');
const AnswerStatus = require('../../../../../lib/domain/models/AnswerStatus');
const config = require('../../../../../lib/config');

describe('Integration | Domain | Algorithm-methods | Flash', function () {
  describe('#getPossibleNextChallenge', function () {
    context('when there is no challenge', function () {
      it('should return hasAssessmentEnded as true and possibleChallenges is empty', function () {
        // given
        const challenges = [];
        const allAnswers = [];

        // when
        const result = flash.getPossibleNextChallenges({ challenges, allAnswers, estimatedLevel: 0 });

        // then
        expect(result).to.deep.equal({
          hasAssessmentEnded: true,
          possibleChallenges: [],
        });
      });
    });

    context('when there is a challenge', function () {
      it('should return hasAssessmentEnded as false and possibleChallenges not empty', function () {
        // given
        const challenge = domainBuilder.buildChallenge();
        const challenges = [challenge];
        const allAnswers = [];

        // when
        const result = flash.getPossibleNextChallenges({ challenges, allAnswers, estimatedLevel: 0 });

        // then
        expect(result).to.deep.equal({
          hasAssessmentEnded: false,
          possibleChallenges: [challenge],
        });
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
          const result = flash.getPossibleNextChallenges({ challenges, allAnswers, estimatedLevel: 0 });

          // then
          expect(result).to.deep.equal({
            hasAssessmentEnded: false,
            possibleChallenges: [bestNextChallenge],
          });
        });

        it('should return every best next challenge', function () {
          // given
          const FirstSkill = domainBuilder.buildSkill({ id: 'First' });
          const SecondSkill = domainBuilder.buildSkill({ id: 'Second' });
          const worstNextChallenge = domainBuilder.buildChallenge({
            difficulty: -5,
            discriminant: -5,
            skill: FirstSkill,
          });
          const bestNextChallenge = domainBuilder.buildChallenge({
            difficulty: 1,
            discriminant: 5,
            skill: SecondSkill,
          });
          const anotherBestNextChallenge = domainBuilder.buildChallenge({
            difficulty: 1,
            discriminant: 5,
            skill: FirstSkill,
          });
          const challenges = [worstNextChallenge, bestNextChallenge, anotherBestNextChallenge];
          const allAnswers = [];

          // when
          const result = flash.getPossibleNextChallenges({ challenges, allAnswers, estimatedLevel: 0 });

          // then
          expect(result).to.deep.equal({
            hasAssessmentEnded: false,
            possibleChallenges: [bestNextChallenge, anotherBestNextChallenge],
          });
        });
      });

      context('when there is a previous answer', function () {
        it('should only return the best next challenge that has no previous answer', function () {
          // given
          const FirstSkill = domainBuilder.buildSkill({ id: 'First' });
          const SecondSkill = domainBuilder.buildSkill({ id: 'Second' });
          const worstNextChallenge = domainBuilder.buildChallenge({
            id: 'recCHAL1',
            difficulty: -5,
            discriminant: -5,
            skill: FirstSkill,
          });
          const answeredBestNextChallenge = domainBuilder.buildChallenge({
            id: 'recCHAL2',
            difficulty: 1,
            discriminant: 3,
            skill: SecondSkill,
          });
          const nonAnsweredBestNextChallenge = domainBuilder.buildChallenge({
            id: 'recCHAL3',
            difficulty: 1,
            discriminant: 3,
            skill: FirstSkill,
          });
          const challenges = [worstNextChallenge, answeredBestNextChallenge, nonAnsweredBestNextChallenge];
          const allAnswers = [
            domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: answeredBestNextChallenge.id }),
          ];

          // when
          const result = flash.getPossibleNextChallenges({ challenges, allAnswers, estimatedLevel: 1.450557193743759 });

          // then
          expect(result).to.deep.equal({
            hasAssessmentEnded: false,
            possibleChallenges: [nonAnsweredBestNextChallenge],
          });
        });
      });
    });

    context('when we reach the maximum number of asked challenges', function () {
      let numberOfChallengesForFlashMethod;

      beforeEach(function () {
        numberOfChallengesForFlashMethod = config.features.numberOfChallengesForFlashMethod;
        config.features.numberOfChallengesForFlashMethod = 2;
      });

      afterEach(function () {
        config.features.numberOfChallengesForFlashMethod = numberOfChallengesForFlashMethod;
      });

      it('should not propose another challenge to the user', function () {
        // given
        const challenge1 = domainBuilder.buildChallenge({
          difficulty: -5,
          discriminant: -5,
        });
        const challenge2 = domainBuilder.buildChallenge({
          difficulty: 1,
          discriminant: 5,
        });
        const challenge3 = domainBuilder.buildChallenge({
          difficulty: 1,
          discriminant: 5,
        });
        const challenges = [challenge1, challenge2, challenge3];
        const answer1 = domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id });
        const answer2 = domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[1].id });
        const allAnswers = [answer1, answer2];

        // when
        const result = flash.getPossibleNextChallenges({ challenges, allAnswers });

        // then
        expect(result).to.deep.equal({
          hasAssessmentEnded: true,
          possibleChallenges: [],
        });
      });
    });

    context('when the user answers a lot of challenges', function () {
      it('should choose the correct challenge', function () {
        const listSkills = {
          url5: domainBuilder.buildSkill({ id: 'url5' }),
          web3: domainBuilder.buildSkill({ id: 'web3' }),
          sourceinfo5: domainBuilder.buildSkill({ id: 'sourceinfo5' }),
          installogiciel2: domainBuilder.buildSkill({ id: 'installogiciel2' }),
          fichier4: domainBuilder.buildSkill({ id: 'fichier4' }),
          sauvegarde5: domainBuilder.buildSkill({ id: 'sauvegarde5' }),
          langbalise6: domainBuilder.buildSkill({ id: 'langbalise6' }),
          pratiquesinternet4: domainBuilder.buildSkill({ id: 'pratiquesinternet4' }),
          langbalise7: domainBuilder.buildSkill({ id: 'langbalise7' }),
        };

        const listChallenges = [
          domainBuilder.buildChallenge({
            id: 'recA',
            skill: listSkills.url5,
            difficulty: -0.917927344545694,
            discriminant: 1.02282430250024,
          }),
          domainBuilder.buildChallenge({
            id: 'recB',
            skill: listSkills.web3,
            difficulty: 0.301604780272093,
            discriminant: 0.815896135600247,
          }),
          domainBuilder.buildChallenge({
            id: 'recC',
            skill: listSkills.sourceinfo5,
            difficulty: -1.69218011589622,
            discriminant: 1.38594509996278,
          }),
          domainBuilder.buildChallenge({
            id: 'recD',
            skill: listSkills.installogiciel2,
            difficulty: -5.4464574841729,
            discriminant: 0.427255285029657,
          }),
          domainBuilder.buildChallenge({
            id: 'recE',
            skill: listSkills.fichier4,
            difficulty: -1.5526216455839,
            discriminant: 1.21015304225808,
          }),
          domainBuilder.buildChallenge({
            id: 'recF',
            skill: listSkills.fichier4,
            difficulty: -1.36561917255237,
            discriminant: 1.09320650236677,
          }),
          domainBuilder.buildChallenge({
            id: 'recG',
            skill: listSkills.fichier4,
            difficulty: -4.20230915443229,
            discriminant: 0.562929008226957,
          }),
          domainBuilder.buildChallenge({
            id: 'recH',
            skill: listSkills.fichier4,
            difficulty: 0.262904155422314,
            discriminant: 0.901542609459213,
          }),
          domainBuilder.buildChallenge({
            id: 'recI',
            skill: listSkills.fichier4,
            difficulty: -0.754355900389256,
            discriminant: 0.834990152043718,
          }),
          domainBuilder.buildChallenge({
            id: 'recJ',
            skill: listSkills.sauvegarde5,
            difficulty: 3.174339929941,
            discriminant: 0.827526706077148,
          }),
          domainBuilder.buildChallenge({
            id: 'recK',
            skill: listSkills.sauvegarde5,
            difficulty: -1.16967416012961,
            discriminant: 1.17433370794629,
          }),
          domainBuilder.buildChallenge({
            id: 'recL',
            skill: listSkills.sauvegarde5,
            difficulty: -0.030736508016524,
            discriminant: 1.06665273005823,
          }),
          domainBuilder.buildChallenge({
            id: 'recM',
            skill: listSkills.sauvegarde5,
            difficulty: -2.37249657419562,
            discriminant: 0.656224379307742,
          }),
          domainBuilder.buildChallenge({
            id: 'recN',
            skill: listSkills.langbalise6,
            difficulty: 1.62670103354638,
            discriminant: 1.50948587856458,
          }),
          domainBuilder.buildChallenge({
            id: 'recO',
            skill: listSkills.langbalise6,
            difficulty: 2.811956480867,
            discriminant: 1.04445171700575,
          }),
          domainBuilder.buildChallenge({
            id: 'recP',
            skill: listSkills.langbalise6,
            difficulty: 0.026713944730478,
            discriminant: 0.703441785686095,
          }),
          domainBuilder.buildChallenge({
            id: 'recQ',
            skill: listSkills.pratiquesinternet4,
            difficulty: -1.83253533603,
            discriminant: 0.711777117426424,
          }),
          domainBuilder.buildChallenge({
            id: 'recR',
            skill: listSkills.pratiquesinternet4,
            difficulty: 0.251708600387063,
            discriminant: 0.369707224301943,
          }),
          domainBuilder.buildChallenge({
            id: 'recS',
            skill: listSkills.pratiquesinternet4,
            difficulty: 1.90647729810166,
            discriminant: 0.950709518595358,
          }),
          domainBuilder.buildChallenge({
            id: 'recT',
            skill: listSkills.langbalise6,
            difficulty: -1.82670103354638,
            discriminant: 2.50948587856458,
          }),
        ];

        const inputs = [
          { answer: domainBuilder.buildAnswer({ challengeId: 'recL', result: AnswerStatus.KO }), estimatedLevel: 0 },
          {
            answer: domainBuilder.buildAnswer({ challengeId: 'recC', result: AnswerStatus.OK }),
            estimatedLevel: -0.6086049191210775,
          },
          {
            answer: domainBuilder.buildAnswer({ challengeId: 'recT', result: AnswerStatus.KO }),
            estimatedLevel: -0.6653800198379971,
          },
          {
            answer: domainBuilder.buildAnswer({ challengeId: 'recE', result: AnswerStatus.OK }),
            estimatedLevel: -1.7794873733366134,
          },
          {
            answer: domainBuilder.buildAnswer({ challengeId: 'recA', result: AnswerStatus.OK }),
            estimatedLevel: -1.8036203882448785,
          },
          {
            answer: domainBuilder.buildAnswer({ challengeId: 'recQ', result: AnswerStatus.OK }),
            estimatedLevel: -1.557864373635504,
          },
        ];

        const expectedChallengeIds = ['recL', 'recC', 'recT', 'recE', 'recA', 'recQ'];

        const allAnswers = [];
        let result;

        for (let i = 0; i < inputs.length; i++) {
          const { answer, estimatedLevel } = inputs[i];
          result = flash.getPossibleNextChallenges({ challenges: listChallenges, allAnswers, estimatedLevel });

          // then
          expect(result.possibleChallenges[0].id).to.equal(expectedChallengeIds[i]);

          allAnswers.push(answer);
        }
      });
    });
  });

  describe('#getEstimatedLevelAndErrorRate', function () {
    it('should return 0 when there is no answers', function () {
      // given
      const allAnswers = [];

      // when
      const result = flash.getEstimatedLevelAndErrorRate({ allAnswers });

      // then
      expect(result).to.deep.equal({
        estimatedLevel: 0,
        errorRate: 5,
      });
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

      // when
      const { estimatedLevel, errorRate } = flash.getEstimatedLevelAndErrorRate({ allAnswers, challenges });

      // then
      expect(estimatedLevel).to.be.closeTo(0.859419960298745, 0.00000000001);
      expect(errorRate).to.be.closeTo(0.9327454634914153, 0.00000000001);
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

      // when
      const { estimatedLevel, errorRate } = flash.getEstimatedLevelAndErrorRate({ allAnswers, challenges });

      // then
      expect(estimatedLevel).to.be.closeTo(1.802340122865396, 0.00000000001);
      expect(errorRate).to.be.closeTo(0.8549014053951466, 0.00000000001);
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

      // when
      const { estimatedLevel, errorRate } = flash.getEstimatedLevelAndErrorRate({ allAnswers, challenges });

      // then
      expect(estimatedLevel).to.be.closeTo(2.851063556136754, 0.00000000001);
      expect(errorRate).to.be.closeTo(0.9271693210547304, 0.00000000001);
    });

    context('when the user answers a lot of challenges', function () {
      it('should return the correct estimatedLevel and errorRate', function () {
        const listSkills = {
          url5: domainBuilder.buildSkill({ id: 'url5' }),
          web3: domainBuilder.buildSkill({ id: 'web3' }),
          sourceinfo5: domainBuilder.buildSkill({ id: 'sourceinfo5' }),
          installogiciel2: domainBuilder.buildSkill({ id: 'installogiciel2' }),
          fichier4: domainBuilder.buildSkill({ id: 'fichier4' }),
          sauvegarde5: domainBuilder.buildSkill({ id: 'sauvegarde5' }),
          langbalise6: domainBuilder.buildSkill({ id: 'langbalise6' }),
          pratiquesinternet4: domainBuilder.buildSkill({ id: 'pratiquesinternet4' }),
          langbalise7: domainBuilder.buildSkill({ id: 'langbalise7' }),
        };

        const listChallenges = [
          domainBuilder.buildChallenge({
            id: 'recA',
            skill: listSkills.url5,
            difficulty: -0.917927344545694,
            discriminant: 1.02282430250024,
          }),
          domainBuilder.buildChallenge({
            id: 'recB',
            skill: listSkills.web3,
            difficulty: 0.301604780272093,
            discriminant: 0.815896135600247,
          }),
          domainBuilder.buildChallenge({
            id: 'recC',
            skill: listSkills.sourceinfo5,
            difficulty: -1.69218011589622,
            discriminant: 1.38594509996278,
          }),
          domainBuilder.buildChallenge({
            id: 'recD',
            skill: listSkills.installogiciel2,
            difficulty: -5.4464574841729,
            discriminant: 0.427255285029657,
          }),
          domainBuilder.buildChallenge({
            id: 'recE',
            skill: listSkills.fichier4,
            difficulty: -1.5526216455839,
            discriminant: 1.21015304225808,
          }),
          domainBuilder.buildChallenge({
            id: 'recF',
            skill: listSkills.fichier4,
            difficulty: -1.36561917255237,
            discriminant: 1.09320650236677,
          }),
          domainBuilder.buildChallenge({
            id: 'recG',
            skill: listSkills.fichier4,
            difficulty: -4.20230915443229,
            discriminant: 0.562929008226957,
          }),
          domainBuilder.buildChallenge({
            id: 'recH',
            skill: listSkills.fichier4,
            difficulty: 0.262904155422314,
            discriminant: 0.901542609459213,
          }),
          domainBuilder.buildChallenge({
            id: 'recI',
            skill: listSkills.fichier4,
            difficulty: -0.754355900389256,
            discriminant: 0.834990152043718,
          }),
          domainBuilder.buildChallenge({
            id: 'recJ',
            skill: listSkills.sauvegarde5,
            difficulty: 3.174339929941,
            discriminant: 0.827526706077148,
          }),
          domainBuilder.buildChallenge({
            id: 'recK',
            skill: listSkills.sauvegarde5,
            difficulty: -1.16967416012961,
            discriminant: 1.17433370794629,
          }),
          domainBuilder.buildChallenge({
            id: 'recL',
            skill: listSkills.sauvegarde5,
            difficulty: -0.030736508016524,
            discriminant: 1.06665273005823,
          }),
          domainBuilder.buildChallenge({
            id: 'recM',
            skill: listSkills.sauvegarde5,
            difficulty: -2.37249657419562,
            discriminant: 0.656224379307742,
          }),
          domainBuilder.buildChallenge({
            id: 'recN',
            skill: listSkills.langbalise6,
            difficulty: 1.62670103354638,
            discriminant: 1.50948587856458,
          }),
          domainBuilder.buildChallenge({
            id: 'recO',
            skill: listSkills.langbalise6,
            difficulty: 2.811956480867,
            discriminant: 1.04445171700575,
          }),
          domainBuilder.buildChallenge({
            id: 'recP',
            skill: listSkills.langbalise6,
            difficulty: 0.026713944730478,
            discriminant: 0.703441785686095,
          }),
          domainBuilder.buildChallenge({
            id: 'recQ',
            skill: listSkills.pratiquesinternet4,
            difficulty: -1.83253533603,
            discriminant: 0.711777117426424,
          }),
          domainBuilder.buildChallenge({
            id: 'recR',
            skill: listSkills.pratiquesinternet4,
            difficulty: 0.251708600387063,
            discriminant: 0.369707224301943,
          }),
          domainBuilder.buildChallenge({
            id: 'recS',
            skill: listSkills.pratiquesinternet4,
            difficulty: 1.90647729810166,
            discriminant: 0.950709518595358,
          }),
          domainBuilder.buildChallenge({
            id: 'recT',
            skill: listSkills.langbalise6,
            difficulty: -1.82670103354638,
            discriminant: 2.50948587856458,
          }),
        ];

        const answers = [
          domainBuilder.buildAnswer({ challengeId: 'recL', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recC', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'recT', result: AnswerStatus.KO }),
          domainBuilder.buildAnswer({ challengeId: 'recE', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'recA', result: AnswerStatus.OK }),
          domainBuilder.buildAnswer({ challengeId: 'recQ', result: AnswerStatus.OK }),
        ];
        const expectedEstimatedLevel = [
          0, -0.6086049191210775, -0.6653800198379971, -1.7794873733366134, -1.8036203882448785, -1.557864373635504,
          -1.3925555729766932,
        ];

        const expectedErrorRate = [
          5, 1.0659524854635638, 0.9249688328247474, 0.6682031829777919, 0.6193894938423906, 0.5934694499356048,
          0.5880298028515323,
        ];

        const allAnswers = [];
        let result;

        for (let i = 0; i < answers.length; i++) {
          result = flash.getEstimatedLevelAndErrorRate({ challenges: listChallenges, allAnswers });

          // then
          expect(result.estimatedLevel).to.be.closeTo(expectedEstimatedLevel[i], 0.000000001);
          expect(result.errorRate).to.be.closeTo(expectedErrorRate[i], 0.000000001);

          allAnswers.push(answers[i]);
        }
      });
    });
  });

  describe('#getChallengesForNonAnsweredSkills', function () {
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
      const result = flash.getChallengesForNonAnsweredSkills({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal(challenges);
    });

    it('should return the list of challenges without already answered skills', function () {
      // given
      const skills = [domainBuilder.buildSkill({ id: 'FirstSkill' }), domainBuilder.buildSkill({ id: 'SecondSkill' })];

      const challenges = [
        domainBuilder.buildChallenge({
          id: 'First',
          discriminant: 1.86350005965093,
          difficulty: 0.194712138508747,
          skill: skills[0],
        }),
        domainBuilder.buildChallenge({
          id: 'Second',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skill: skills[0],
        }),
        domainBuilder.buildChallenge({
          id: 'Third',
          discriminant: 2.25422414740233,
          difficulty: 0.823376599163319,
          skill: skills[1],
        }),
      ];

      const allAnswers = [domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id })];

      // when
      const result = flash.getChallengesForNonAnsweredSkills({ allAnswers, challenges });

      // then
      expect(result).to.be.deep.equal([challenges[2]]);
    });
  });

  describe('#calculateTotalPixScore', function () {
    describe('when there is no answer', function () {
      it('should return a score of 0', function () {
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
        const result = flash.calculateTotalPixScore({ allAnswers, challenges });

        // then
        expect(result).to.equal(0);
      });
    });

    describe('when there are answers', function () {
      it('should return a score of 11', function () {
        // given
        const skills = [
          domainBuilder.buildSkill({ id: 'FirstSkill', pixValue: 1 }),
          domainBuilder.buildSkill({ id: 'SecondSkill', pixValue: 10 }),
          domainBuilder.buildSkill({ id: 'ThirdSkill', pixValue: 100 }),
          domainBuilder.buildSkill({ id: 'FourthSkill', pixValue: 1000 }),
          domainBuilder.buildSkill({ id: 'FifthSkill', pixValue: 10000 }),
        ];

        const challenges = [
          domainBuilder.buildChallenge({
            id: 'First',
            skill: skills[0],
          }),
          domainBuilder.buildChallenge({
            id: 'Second',
            skill: skills[1],
          }),
          domainBuilder.buildChallenge({
            id: 'Third',
            skill: skills[2],
          }),
          domainBuilder.buildChallenge({
            id: 'Fourth',
            skill: skills[3],
          }),
          domainBuilder.buildChallenge({
            id: 'Fifth',
            skill: skills[4],
          }),
        ];

        const allAnswers = [
          domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[0].id }),
          domainBuilder.buildAnswer({ result: AnswerStatus.OK, challengeId: challenges[1].id }),
          domainBuilder.buildAnswer({ result: AnswerStatus.KO, challengeId: challenges[2].id }),
          domainBuilder.buildAnswer({ result: AnswerStatus.SKIPPED, challengeId: challenges[3].id }),
        ];

        // when
        const result = flash.calculateTotalPixScore({ allAnswers, challenges });

        // then
        expect(result).to.equal(11);
      });
    });
  });
});
