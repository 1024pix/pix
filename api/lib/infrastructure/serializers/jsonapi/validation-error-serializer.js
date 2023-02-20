import _ from 'lodash';

function _buildError(field, message) {
  return {
    status: '400',
    title: 'Invalid Attribute',
    detail: message,
    source: { pointer: '/data/attributes/' + _.kebabCase(field) },
    meta: { field },
  };
}

function _buildEntirePayloadError(message) {
  return {
    status: '400',
    title: 'Invalid Payload',
    detail: message,
    source: { pointer: '/data/attributes' },
  };
}

function serialize(validationErrors) {
  const errors = [];

  Object.keys(validationErrors.data).forEach(function (field) {
    validationErrors.data[field].forEach((message) => {
      if (_.isEmpty(field)) {
        errors.push(_buildEntirePayloadError(message));
      } else {
        errors.push(_buildError(field, message));
      }
    });
  });

  return {
    errors,
  };
}

export default { serialize };
