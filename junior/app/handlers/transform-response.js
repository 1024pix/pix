import { camelize, singularize } from '@warp-drive/utilities/string';

export const TransformResponse = {
  request(context, next) {
    return next(context.request).then(({ content }) => {
      return normalizeResponse(content);
    });
  },
};

function normalizeResponse(content) {
  const result = singularizeType(content);
  return result;
}

function singularizeType(content) {
  if (typeof content !== 'object') {
    return content;
  }

  const result = Object.entries(content).reduce((acc, [key, value]) => {
    let resultValue = value;

    if (key === 'type') {
      resultValue = singularize(value);
    } else if (Array.isArray(value)) {
      resultValue = value.map(singularizeType);
    } else if (value !== null && value !== undefined && typeof value === 'object') {
      resultValue = singularizeType(value);
    }
    acc[camelize(key)] = resultValue;
    return acc;
  }, {});
  return result;
}
