import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer } = jsonapiSerializer;
import { AssessmentResult } from '../../../../../shared/domain/models/AssessmentResult.js';

const deserialize = async function (payload) {
  const assessmentResult = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);

  return new AssessmentResult({
    assessmentId: assessmentResult.assessmentId,
    emitter: assessmentResult.emitter,
    commentByJury: assessmentResult.commentForJury,
    commentForCandidate: assessmentResult.commentForCandidate,
    commentForOrganization: assessmentResult.commentForOrganization,
    pixScore: assessmentResult.pixScore,
    status: assessmentResult.status,
  });
};

export { deserialize };
