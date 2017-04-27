function _buildError(field, message) {
  return {
    'status': '400',
    'title':  'Invalid Attribute',
    'details': message,
    'source': { 'pointer': '/data/attributes/' + field },
    'meta': { field },
  };
}

function serialize(validationErrors) {
  const errors = [];

  Object.keys(validationErrors.data).forEach(function (field) {
    validationErrors.data[ field ].forEach((message) => {
      errors.push(_buildError(field, message));
    });
  });

  return {
    errors
  };
}

module.exports = { serialize };
