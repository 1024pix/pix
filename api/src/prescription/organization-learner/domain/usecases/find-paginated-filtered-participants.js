const findPaginatedFilteredParticipants = async function ({
  organizationId,
  filters,
  extraFilters,
  page,
  sort,
  organizationParticipantRepository,
  organizationLearnerImportFormatRepository,
  organizationFeaturesAPI,
}) {
  const organizationFeatures = await organizationFeaturesAPI.getAllFeaturesFromOrganization(organizationId);

  if (organizationFeatures.hasLearnersImportFeature) {
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const { organizationParticipants, meta } =
      await organizationParticipantRepository.findPaginatedFilteredImportedParticipants({
        organizationId,
        extraColumns: importFormat.extraColumns,
        extraFilters,
        filters,
        sort,
        page,
      });

    meta.headingCustomColumns = importFormat.columnsToDisplay;
    meta.customFilters = importFormat.filtersToDisplay;

    return { organizationParticipants, meta };
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
