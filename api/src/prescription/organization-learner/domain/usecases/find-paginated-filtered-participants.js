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

    // TODO récupérer le featureId qui nous intéresse, pour l'oralization activé
    // TODO Branger le organizationLearnerFeatureRepository pour récupérer les organizationLearners concerné par la feature

    const { organizationParticipants, meta } =
      await organizationParticipantRepository.findPaginatedFilteredImportedParticipants({
        organizationId,
        extraColumns: importFormat.extraColumns,
        extraFilters,
        filters,
        sort,
        page,
      });

    // TODO Si oralization activée pour l'orga, décorer la liste des organizationPArticipants avec l'info

    meta.headingCustomColumns = importFormat.columnsToDisplay;
    if (organizationFeatures.hasOralizationFeature) {
      meta.headingCustomColumns.push('ORALIZATION');
    }
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
