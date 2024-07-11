import jsonapiSerializer from 'jsonapi-serializer';

import { _ } from '../../../../shared/infrastructure/utils/lodash-utils.js';
const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const dto = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(payload);
  return _sanitizeComment(dto.commentByJury);
};

export { deserialize };

const _sanitizeComment = (comment) => {
  return _.isBlank(comment) ? undefined : comment.trim();
};
