import { dasherize, pluralize } from '@warp-drive/utilities/string';
export const TransformRequest = {
  request(context, next) {
    if (context.request.method === 'GET') {
      return next(context.request);
    }

    context.request = {
      ...context.request,
      body: normalizeRequest(context.request.body ?? {}),
    };

    return next(context.request);
  },
};

function normalizeRequest(content) {
  const result = pluralizeType(JSON.parse(content));

  return JSON.stringify(result);
}

function pluralizeType(content) {
  if (typeof content !== 'object') {
    return content;
  }

  const result = Object.entries(content).reduce((acc, [key, value]) => {
    let resultValue = value;

    if (key === 'type') {
      resultValue = pluralize(value);
    } else if (Array.isArray(value)) {
      resultValue = value.map(pluralizeType);
    } else if (value !== null && value !== undefined && typeof value === 'object') {
      resultValue = pluralizeType(value);
    }

    if (key !== 'lid' && !(key === 'id' && value === null)) {
      acc[dasherize(key)] = resultValue;
    }

    return acc;
  }, {});
  return result;
}
