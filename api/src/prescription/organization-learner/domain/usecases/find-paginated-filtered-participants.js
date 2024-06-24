const findPaginatedFilteredParticipants = async function ({
  organizationId,
  filters,
  page,
  sort,
  organizationParticipantRepository,
  organizationFeaturesAPI,
}) {
  const organizationFeatures = await organizationFeaturesAPI.getAllFeaturesFromOrganization(organizationId);

  if (organizationFeatures.hasLearnersImportFeature) {
    return organizationParticipantRepository.findPaginatedFilteredImportedParticipants({
      organizationId,
      filters,
      sort,
      page,
    });
  } else {
    return organizationParticipantRepository.findPaginatedFilteredParticipants({
      organizationId,
      filters,
      sort,
      page,
    });
  }
};

export { findPaginatedFilteredParticipants };
