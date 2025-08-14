import { tagRepository as injectedTagRepository } from '../../infrastructure/repositories/tag.repository.js'; /**
 * Retrieves all tags from the repository.
 *
 * @returns {Promise<Array>} A promise that resolves to an array of tags.
 */
const findAllTags = function ({ tagRepository = injectedTagRepository } = {}) {
  return tagRepository.findAll();
};

export { findAllTags };
