import { Tag } from '../../../src/organizational-entities/domain/models/Tag.js';

const createTag = async function ({ tagName, tagRepository }) {
  const tag = new Tag({ name: tagName });
  return tagRepository.create(tag);
};

export { createTag };
