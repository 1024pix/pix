import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize({ version, areas }) {
  const data = {
    id: version.id,
    startDate: version.startDate,
    expirationDate: version.expirationDate,
    assessmentDuration: version.assessmentDuration,
    minimumAnswersRequiredForValidation: version.minimumAnswersRequiredToValidateACertification,
    maximumAssessmentLength: version.challengesConfiguration?.maximumAssessmentLength,
    comments: version.comments,
    areas,
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
