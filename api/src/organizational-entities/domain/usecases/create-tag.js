import { tagRepository as injectedTagRepository } from '../../infrastructure/repositories/tag.repository.js';
import { Tag } from '../models/Tag.js';

/**
 * @param {Object} params
 * @param {String} params.tagName
 * @param {TagRepository} params.tagRepository
 * @returns {Promise<Tag>}
 */
const createTag = async function ({ tagName, tagRepository = injectedTagRepository } = {}) {
  const tag = new Tag({ name: tagName });
  return tagRepository.create(tag);
};

export { createTag };
