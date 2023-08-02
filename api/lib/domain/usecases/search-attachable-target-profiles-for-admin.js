const searchAttachableTargetProfilesForAdmin = async function ({
  searchTerm,
  targetProfileAttachableForAdminRepository,
}) {
  return targetProfileAttachableForAdminRepository.find({ searchTerm });
};

export { searchAttachableTargetProfilesForAdmin };
