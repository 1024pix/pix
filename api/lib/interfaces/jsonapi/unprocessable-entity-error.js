const _ = require('lodash');
const JSONAPIError = require('jsonapi-serializer').Error;

function _formatInvalidAttribute({ attribute, message }) {
  return {
    status: '422',
    source: {
      pointer: `/data/attributes/${ _.kebabCase(attribute) }`,
    },
    title: `Invalid data attribute "${ attribute }"`,
    detail: message
  };
}

module.exports = (invalidAttributes) => {
  return new JSONAPIError(invalidAttributes.map(_formatInvalidAttribute));
};
