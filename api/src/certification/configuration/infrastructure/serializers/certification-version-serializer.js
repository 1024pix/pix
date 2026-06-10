import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export const serialize = (version) => {
  const data = {
    id: version.id,
    startDate: version.startDate,
    expirationDate: version.expirationDate,
    assessmentDuration: version.assessmentDuration,
    minimumAnswersRequiredForValidation: version.minimumAnswersRequiredToValidateACertification,
    maximumAssessmentLength: version.challengesConfiguration?.maximumAssessmentLength,
    comments: version.comments,
  };

  return new Serializer('certification-versions', {
    attributes: [
      'startDate',
      'expirationDate',
      'assessmentDuration',
      'minimumAnswersRequiredForValidation',
      'maximumAssessmentLength',
      'comments',
    ],
  }).serialize(data);
};
