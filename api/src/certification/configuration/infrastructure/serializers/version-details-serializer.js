import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize(versionDetails) {
  const data = {
    id: versionDetails.id,
    startDate: versionDetails.startDate,
    expirationDate: versionDetails.expirationDate,
    assessmentDuration: versionDetails.assessmentDuration,
    minimumAnswersRequiredForValidation: versionDetails.minimumAnswersRequiredForValidation,
    maximumAssessmentLength: versionDetails.maximumAssessmentLength,
    comments: versionDetails.comments,
    areas: versionDetails.areas,
  };

  return new Serializer('certification-versions', {
    attributes: [
      'startDate',
      'expirationDate',
      'assessmentDuration',
      'minimumAnswersRequiredForValidation',
      'maximumAssessmentLength',
      'comments',
      'areas',
    ],
    areas: {
      ref: 'id',
      included: true,
      attributes: ['title', 'code', 'color', 'frameworkId', 'competences'],
      competences: {
        ref: 'id',
        included: true,
        attributes: ['name', 'index', 'thematics'],
        thematics: {
          ref: 'id',
          included: true,
          attributes: ['name', 'index', 'tubes'],
          tubes: {
            ref: 'id',
            included: true,
            attributes: ['name', 'practicalTitle', 'level', 'mobile', 'tablet', 'skills'],
            skills: {
              ref: 'id',
              included: true,
              attributes: ['difficulty'],
            },
          },
        },
      },
    },
  }).serialize(data);
}
