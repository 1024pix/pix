const Tag = require('../models/Tag.js');

module.exports = async function createTag({ tagName, tagRepository }) {
  const tag = new Tag({ name: tagName });
  return tagRepository.create(tag);
};
