import _ from 'lodash';

import { domainBuilder, expect, sinon } from '../../../test-helper.js';
import { AnswerStatus } from '../../../../lib/domain/models/index.js';
import { CertificationAssessmentScoreV3 } from '../../../../lib/domain/models/CertificationAssessmentScoreV3.js';

describe('Unit | Domain | Models | CertificationAssessmentScoreV3 ', function () {
  const assessmentId = 1234;
  const secondAssessmentId = 456;

  let answerRepository;
  let challengeRepository;

  let baseChallenges;
  let baseAnswers;
  let challenge4;

  beforeEach(function () {
    answerRepository = {
      findByAssessment: sinon.stub(),
    };
    challengeRepository = {
      findFlashCompatible: sinon.stub(),
    };

    const challenge1 = domainBuilder.buildChallenge({
      id: 'recCHAL1',
      discriminant: 1,
      difficulty: 0,
    });
    const challenge2 = domainBuilder.buildChallenge({
      id: 'recCHAL2',
      discriminant: 1,
      difficulty: 4,
    });
    const challenge3 = domainBuilder.buildChallenge({
      id: 'recCHAL3',
      discriminant: 1,
      difficulty: 2,
    });

    challenge4 = domainBuilder.buildChallenge({
      id: 'recCHAL4',
      discriminant: 1,
      difficulty: 2,
    });

    const answer1 = domainBuilder.buildAnswer({
      id: 'ans1',
      challengeId: challenge1.id,
    });

    const answer2 = domainBuilder.buildAnswer({
      id: 'ans2',
      challengeId: challenge2.id,
      result: AnswerStatus.KO,
    });

    const answer3 = domainBuilder.buildAnswer({
      id: 'ans3',
      challengeId: challenge3.id,
    });

    baseChallenges = [challenge1, challenge2, challenge3, challenge4];
    baseAnswers = [answer1, answer3, answer2];
  });

  it('should return the score', async function () {
    answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
    challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);

    const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
      challenges: baseChallenges,
      allAnswers: baseAnswers,
    });

    expect(score.nbPix).to.equal(658);
  });

  describe('when a wrong answer is added', function () {
    it('should decrease the score', async function () {
      const wrongAnswer = domainBuilder.buildAnswer({
        result: AnswerStatus.KO,
        challengeId: challenge4.id,
      });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
      answerRepository.findByAssessment.withArgs(secondAssessmentId).resolves([...baseAnswers, wrongAnswer]);
      challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);

      const baseScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges: baseChallenges,
        allAnswers: baseAnswers,
      });

      const newScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges: baseChallenges,
        allAnswers: [...baseAnswers, wrongAnswer],
      });

      expect(newScore.nbPix).to.be.lessThan(baseScore.nbPix);
    });
  });

  describe('when a correct answer is added', function () {
    it('should increase the score', async function () {
      const correctAnswer = domainBuilder.buildAnswer({
        result: AnswerStatus.OK,
        challengeId: challenge4.id,
      });
      answerRepository.findByAssessment.withArgs(assessmentId).resolves(baseAnswers);
      answerRepository.findByAssessment.withArgs(secondAssessmentId).resolves([...baseAnswers, correctAnswer]);
      challengeRepository.findFlashCompatible.withArgs().resolves(baseChallenges);

      const baseScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges: baseChallenges,
        allAnswers: baseAnswers,
      });

      const newScore = CertificationAssessmentScoreV3.fromChallengesAndAnswers({
        challenges: baseChallenges,
        allAnswers: [...baseAnswers, correctAnswer],
      });

      expect(newScore.nbPix).to.be.greaterThan(baseScore.nbPix);
    });
  });

  describe('when we reach an estimated level below the MINIMUM', function () {
    it('the score should be 0', function () {
      // given
      const veryEasyDifficulty = -8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryEasyDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.KO);

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({ challenges, allAnswers });

      // then
      expect(score.nbPix).to.equal(0);
    });
  });

  describe('when we reach an estimated level above the MAXIMUM', function () {
    it('the score should be 1024', function () {
      // given
      const veryHardDifficulty = 8;
      const numberOfChallenges = 32;
      const challenges = _buildChallenges(veryHardDifficulty, numberOfChallenges);
      const allAnswers = _buildAnswersForChallenges(challenges, AnswerStatus.OK);

      // when
      const score = CertificationAssessmentScoreV3.fromChallengesAndAnswers({ challenges, allAnswers });

      // then
      expect(score.nbPix).to.equal(1024);
    });
  });
});

const _buildChallenges = (difficulty, numberOfChallenges) => {
  const discriminant = 1;

  return _.range(0, numberOfChallenges).map((index) =>
    domainBuilder.buildChallenge({
      id: `recCHALL${index}`,
      difficulty,
      discriminant,
    }),
  );
};

const _buildAnswersForChallenges = (challenges, answerResult) => {
  return challenges.map(({ id: challengeId }) =>
    domainBuilder.buildAnswer({
      result: answerResult,
      challengeId,
    }),
  );
};
