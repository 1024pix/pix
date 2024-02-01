import jsonapiSerializer from 'jsonapi-serializer';
import { _ } from '../../../../../shared/infrastructure/utils/lodash-utils.js';
const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const dto = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(payload);
  return {
    commentByJury: _sanitizeComment(dto.commentByJury),
    commentForCandidate: _sanitizeComment(dto.commentForCandidate),
    commentForOrganization: _sanitizeComment(dto.commentForOrganization),
  };
};

export { deserialize };

const _sanitizeComment = (comment) => {
  return _.isBlank(comment) ? undefined : comment.trim();
};
