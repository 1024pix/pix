import { ReconcileCommonOrganizationLearnerError } from '../errors.js';

/**
 * @name reconcileCommonOrganizationLearner
 * @param {Object} params
 * @param {string} params.campaignCode
 * @param {number} params.userId
 * @param {Object} params.reconciliationInfos
 *
 * @returns {Promise<void>}
 */
const reconcileCommonOrganizationLearner = async function ({
  campaignCode,
  userId,
  reconciliationInfos,
  campaignRepository,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
}) {
  const campaign = await campaignRepository.getByCode(campaignCode);
  if (!campaign) {
    throw new ReconcileCommonOrganizationLearnerError('CAMPAIGN_NOT_FOUND');
  }

  const features = await organizationFeatureApi.getAllFeaturesFromOrganization(campaign.organizationId);
  if (!features.hasLearnersImportFeature) {
    throw new ReconcileCommonOrganizationLearnerError('MISSING_IMPORT_FEATURE');
  }

  const importFormat = await organizationLearnerImportFormatRepository.get(campaign.organizationId);
  if (!importFormat) {
    throw new ReconcileCommonOrganizationLearnerError('IMPORT_FORMAT_NOT_FOUND');
  }

  const matchingLearners = await organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos({
    organizationId: campaign.organizationId,
    reconciliationInformations: importFormat.transformReconciliationData(reconciliationInfos),
  });

  if (matchingLearners.length === 0) {
    throw new ReconcileCommonOrganizationLearnerError('NO_MATCH');
  }
  if (matchingLearners.length > 1) {
    throw new ReconcileCommonOrganizationLearnerError('MULTIPLE_MATCHES');
  }
  const [learnerToReconcile] = matchingLearners;
  learnerToReconcile.reconcileUser(userId);
  organizationLearnerRepository.update(learnerToReconcile);
};

export { reconcileCommonOrganizationLearner };
