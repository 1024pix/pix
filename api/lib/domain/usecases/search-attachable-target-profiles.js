const searchAttachableTargetProfiles = async function ({ searchTerm, attachableTargetProfileRepository }) {
  return attachableTargetProfileRepository.find({ searchTerm });
};

export { searchAttachableTargetProfiles };
