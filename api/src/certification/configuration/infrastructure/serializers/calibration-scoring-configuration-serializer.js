import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(calibrationScoringConfiguration) {
  return new Serializer('calibration-scoring-configurations', {
    attributes: ['calibrationId', 'availability', 'globalScoringConfiguration'],
    transform: (calibrationScoringConfiguration) => {
      return {
        id: `${calibrationScoringConfiguration.calibrationId}`,
        calibrationId: calibrationScoringConfiguration.calibrationId,
        availability: calibrationScoringConfiguration.availability,
        globalScoringConfiguration: calibrationScoringConfiguration.globalScoringConfiguration,
      };
    },
  }).serialize(calibrationScoringConfiguration);
}
