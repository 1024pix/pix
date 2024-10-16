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

    if (organizationFeatures.hasOralizationFeature) {
      return await _addOralizationInformations({
        organizationId,
        meta,
        organizationParticipants,
        organizationLearnerFeatureRepository,
      });
    }
    return { organizationParticipants, meta };
  }

  return organizationParticipantRepository.findPaginatedFilteredParticipants({
    organizationId,
    filters,
    sort,
    page,
  });
};

async function _addOralizationInformations({
  organizationId,
  meta,
  organizationParticipants,
  organizationLearnerFeatureRepository,
}) {
  meta.headingCustomColumns.push('ORALIZATION');
  return {
    meta,
    organizationParticipants: await _addOralizationInformationToParticipants({
      organizationId,
      organizationParticipants,
      organizationLearnerFeatureRepository,
    }),
  };
}

async function _addOralizationInformationToParticipants({
  organizationId,
  organizationParticipants,
  organizationLearnerFeatureRepository,
}) {
  const learnersWithOralizationFeature = await organizationLearnerFeatureRepository.getLearnersByFeature({
    organizationId,
    featureKey: ORGANIZATION_FEATURE.ORALIZATION.key,
  });
  return organizationParticipants?.map((participant) => {
    const hasOralization = learnersWithOralizationFeature.some(
      (learnerWithOralization) => learnerWithOralization.id === participant.id,
    );
    participant.extraColumns['ORALIZATION'] = hasOralization;

    return participant;
  });
}

export { findPaginatedFilteredParticipants };
