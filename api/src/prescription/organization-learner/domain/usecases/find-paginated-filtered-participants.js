import { ORGANIZATION_FEATURE } from '../../../../shared/domain/constants.js';

const findPaginatedFilteredParticipants = async function ({
  organizationId,
  filters,
  extraFilters,
  page,
  sort,
  organizationParticipantRepository,
  organizationLearnerImportFormatRepository,
  organizationFeaturesAPI,
  organizationLearnerFeatureRepository,
}) {
  const organizationFeatures = await organizationFeaturesAPI.getAllFeaturesFromOrganization(organizationId);

  let organizationParticipants, meta;
  if (organizationFeatures.hasLearnersImportFeature) {
    const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

    const result = await organizationParticipantRepository.findPaginatedFilteredImportedParticipants({
      organizationId,
      extraColumns: importFormat.extraColumns,
      extraFilters,
      filters,
      sort,
      page,
    });
    organizationParticipants = result.organizationParticipants;
    meta = result.meta;

    meta.headingCustomColumns = importFormat.columnsToDisplay;
    meta.customFilters = importFormat.filtersToDisplay;
  } else {
    const result = await organizationParticipantRepository.findPaginatedFilteredParticipants({
      organizationId,
      filters,
      sort,
      page,
    });
    organizationParticipants = result?.organizationParticipants;
    meta = result?.meta;
  }
  if (organizationFeatures.hasOralizationFeature) {
    const learnersWithOralizationFeature = await organizationLearnerFeatureRepository.getLearnersByFeature({
      organizationId,
      featureKey: ORGANIZATION_FEATURE.ORALIZATION,
    });
    meta.headingCustomColumns.push('ORALIZATION');
    return {
      meta,
      organizationParticipants: organizationParticipants?.map((participant) => {
        const hasOralization = learnersWithOralizationFeature.some(
          (learnerWithOralization) => learnerWithOralization.id === participant.id,
        )
          ? 'true'
          : 'false';
        participant.extraColumns['ORALIZATION'] = hasOralization;

        return participant;
      }),
    };
  }
  return { organizationParticipants, meta };
};

export { findPaginatedFilteredParticipants };
