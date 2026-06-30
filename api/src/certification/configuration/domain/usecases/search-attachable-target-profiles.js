// @ts-check
/**
 * @typedef {import ('../../domain/usecases/index.js').AttachableTargetProfileRepository} AttachableTargetProfileRepository
 */

/**
 * @param {object} params
 * @param {string} [params.searchTerm]
 * @param {AttachableTargetProfileRepository} params.attachableTargetProfileRepository
 */
export async function searchAttachableTargetProfiles({ searchTerm, attachableTargetProfileRepository }) {
  return attachableTargetProfileRepository.find({ searchTerm });
}
