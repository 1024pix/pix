/**
 * @typedef {import ('../../domain/usecases/index.js').AttachableTargetProfileRepository} AttachableTargetProfileRepository
 */

/**
 * @param {Object} params
 * @param {AttachableTargetProfileRepository} params.attachableTargetProfileRepository
 */
const searchAttachableTargetProfiles = async function ({ searchTerm, attachableTargetProfileRepository }) {
  return attachableTargetProfileRepository.find({ searchTerm });
};

export { searchAttachableTargetProfiles };
