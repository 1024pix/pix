import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function ({ flashAlgorithmConfiguration }) {
  const attributes = [
    'warmUpLength',
    'forcedCompetences',
    'maximumAssessmentLength',
    'challengesBetweenSameCompetence',
    'minimumEstimatedSuccessRateRanges',
    'limitToOneQuestionPerTube',
    'enablePassageByAllCompetences',
    'doubleMeasuresUntil',
    'variationPercent',
    'variationPercentUntil',
  ];
  return new Serializer('flash-algorithm-configurations', {
    transform(config) {
      return { id: 0, ...config };
    },
    attributes,
  }).serialize(flashAlgorithmConfiguration);
};

export { serialize };
