import * as injectedOrganizationFeatureApi from '../../../../organizational-entities/application/api/organization-features-api.js';
import * as injectedUserReconciliationService from '../../../../shared/domain/services/user-reconciliation-service.js';
import * as injectedCampaignRepository from '../../../campaign/infrastructure/repositories/campaign-repository.js';
import * as injectedOrganizationLearnerImportFormatRepository from '../../infrastructure/repositories/organization-learner-import-format-repository.js';
import * as injectedOrganizationLearnerRepository from '../../infrastructure/repositories/organization-learner-repository.js';
import { ReconcileCommonOrganizationLearnerError } from '../errors.js';

/**
 * La réconciliation se passe en 2 étapes :
 *  1. On récupére les utilisateurs qui correspondent aux données de l'import hors nom prénom.
 *  2. On identifie le bon préscrit sur la base du nom prénom en utilisant le service de réconciliation
 *     Cela nous permet d'éviter les coquilles typographiques (prénom accentué ou caractère autres qu'alphanumérique...)

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
  campaignRepository = injectedCampaignRepository,
  organizationFeatureApi = injectedOrganizationFeatureApi,
  organizationLearnerImportFormatRepository = injectedOrganizationLearnerImportFormatRepository,
  organizationLearnerRepository = injectedOrganizationLearnerRepository,
  userReconciliationService = injectedUserReconciliationService,
} = {}) {
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

  const transformedReconciliationData = importFormat.transformReconciliationData(reconciliationInfos);

  const matchingLearners = await organizationLearnerRepository.findAllCommonOrganizationLearnerByReconciliationInfos({
    organizationId: campaign.organizationId,
    reconciliationInformations: transformedReconciliationData.attributes,
  });

  if (matchingLearners.length === 0) {
    throw new ReconcileCommonOrganizationLearnerError('NO_MATCH');
  }

  const learnerId = userReconciliationService.findMatchingCandidateIdForGivenUser(
    matchingLearners,
    transformedReconciliationData,
  );
  if (!learnerId) {
    throw new ReconcileCommonOrganizationLearnerError('NO_MATCH');
  }

  const learnerToReconcile = matchingLearners.find((matchingLearner) => matchingLearner.id === learnerId);

  await learnerToReconcile.reconcileUser(userId);
  await organizationLearnerRepository.update(learnerToReconcile);
};

export { reconcileCommonOrganizationLearner };
