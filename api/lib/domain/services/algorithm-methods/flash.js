const DEFAULT_ESTIMATED_LEVEL = 0;

module.exports = { getPossibleNextChallenges, getEstimatedLevel };

function getPossibleNextChallenges({ challenges } = {}) {
  if (challenges?.length === 0) {
    return {
      hasAssessmentEnded: true,
      possibleChallenges: [],
    };
  }

  const estimatedLevel = DEFAULT_ESTIMATED_LEVEL;

  const challengesWithReward = challenges.map((challenge) => {
    return {
      challenge,
      reward: _getReward({ estimatedLevel, discriminant: challenge.discriminant, difficulty: challenge.difficulty }),
    };
  });

  let maxReward = 0;
  const possibleChallenges = challengesWithReward.reduce((acc, challengesWithReward) => {
    if (challengesWithReward.reward > maxReward) {
      acc = [challengesWithReward.challenge];
      maxReward = challengesWithReward.reward;
    } else if (challengesWithReward.reward === maxReward) {
      acc.push(challengesWithReward.challenge);
    }
    return acc;
  }, []);

  return {
    hasAssessmentEnded: false,
    possibleChallenges,
  };
}

function _getProbability({ estimatedLevel, discriminant, difficulty }) {
  return 1 / (1 + Math.exp(discriminant * (difficulty - estimatedLevel)));
}

function _getReward({ estimatedLevel, discriminant, difficulty }) {
  const probability = _getProbability({ estimatedLevel, discriminant, difficulty });
  return probability * (1 - probability) * Math.pow(discriminant, 2);
}

function getEstimatedLevel({ allAnswers, challenges }) {
  return DEFAULT_ESTIMATED_LEVEL;
}



