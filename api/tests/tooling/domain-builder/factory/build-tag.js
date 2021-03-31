const Tag = require('../../../../lib/domain/models/Tag');

function buildTag({
  id = 123,
  name = 'Type',
} = {}) {
  return new Tag({
    id,
    name,
  });
}

module.exports = buildTag;
