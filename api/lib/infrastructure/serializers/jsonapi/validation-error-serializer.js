function _buildError(field, message) {
  return {
    'status': '400',
    'title': 'Invalid Attribute',
    'detail': message,
    'source': {'pointer': '/data/attributes/' + _toKebabCase(field)},
    'meta': {field},
  };
}

function _toKebabCase(fieldName) {
  return fieldName.replace(/([A-Z])/g, (g) => `-${g[0].toLowerCase()}`);
}

function serialize(validationErrors) {
  const errors = [];

  Object.keys(validationErrors.data).forEach(function(field) {
    validationErrors.data[field].forEach((message) => {
      errors.push(_buildError(field, message));
    });
  });

  return {
    errors
  };
}

module.exports = {serialize};
