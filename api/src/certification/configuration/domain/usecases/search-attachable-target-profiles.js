import * as injectedAttachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js'; /**
 * @typedef {import ('../../domain/usecases/index.js').AttachableTargetProfileRepository} AttachableTargetProfileRepository
 */

/**
 * @param {Object} params
 * @param {AttachableTargetProfileRepository} params.attachableTargetProfileRepository
 */
const searchAttachableTargetProfiles = async function ({
  searchTerm,
  attachableTargetProfileRepository = injectedAttachableTargetProfileRepository,
} = {}) {
  return attachableTargetProfileRepository.find({ searchTerm });
};

export { searchAttachableTargetProfiles };
