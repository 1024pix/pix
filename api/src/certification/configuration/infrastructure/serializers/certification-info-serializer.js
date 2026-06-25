import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(certificationInfo) {
  const data = {
    id: certificationInfo.framework,
    assessmentDuration: certificationInfo.assessmentDuration,
    minimumAssessmentLength: certificationInfo.minimumAssessmentLength,
    maximumAssessmentLength: certificationInfo.maximumAssessmentLength,
  };
  return new Serializer('certification-infos', {
    attributes: ['assessmentDuration', 'minimumAssessmentLength', 'maximumAssessmentLength'],
  }).serialize(data);
}

export const certificationInfoSerializer = { serialize };
