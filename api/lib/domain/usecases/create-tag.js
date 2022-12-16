const Tag = require('../models/Tag');

module.exports = async function createTag({ tagName, tagRepository }) {
  const tag = new Tag({ name: tagName });
  return tagRepository.create(tag);
};
