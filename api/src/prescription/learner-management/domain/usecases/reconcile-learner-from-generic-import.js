import { ReconcileLearnerFromGenericImportError } from '../errors.js';

/**
 * La réconciliation se passe en 2 étapes :
 *  1. On récupère les utilisateurs qui correspondent aux données de l'import hors nom prénom.
 *  2. On identifie le bon prescrit sur la base du nom prénom en utilisant le service de réconciliation
 *     Cela nous permet d'éviter les coquilles typographiques (prénom accentué ou caractère autres qu'alphanumérique...)

 * @name reconcileLearnerFromGenericImport
 * @param {Object} params
 * @param {string} params.code
 * @param {number} params.userId
 * @param {Object} params.reconciliationInfos
 *
 * @returns {Promise<void>}
 */
const reconcileLearnerFromGenericImport = async function ({
  organizationId,
  userId,
  reconciliationInfos,
  organizationFeatureApi,
  organizationLearnerImportFormatRepository,
  organizationLearnerRepository,
  userReconciliationService,
}) {
  const features = await organizationFeatureApi.getAllFeaturesFromOrganization(organizationId);
  if (!features.hasLearnersImportFeature) {
    throw new ReconcileLearnerFromGenericImportError('MISSING_IMPORT_FEATURE');
  }

  const importFormat = await organizationLearnerImportFormatRepository.get(organizationId);

  if (!importFormat) {
    throw new ReconcileLearnerFromGenericImportError('IMPORT_FORMAT_NOT_FOUND');
  }

  const transformedReconciliationData = importFormat.transformReconciliationData(reconciliationInfos);

  const matchingLearners = await organizationLearnerRepository.findAllGenericOrganizationLearnerByReconciliationInfos({
    organizationId,
    reconciliationInformations: transformedReconciliationData.attributes,
  });

  if (matchingLearners.length === 0) {
    throw new ReconcileLearnerFromGenericImportError('NO_MATCH');
  }

  const learnerId = userReconciliationService.findMatchingCandidateIdForGivenUser(
    matchingLearners,
    transformedReconciliationData,
  );

  if (!learnerId) {
    throw new ReconcileLearnerFromGenericImportError('NO_MATCH');
  }

  const learnerToReconcile = matchingLearners.find((matchingLearner) => matchingLearner.id === learnerId);

  await learnerToReconcile.reconcileUser(userId);
  await organizationLearnerRepository.update(learnerToReconcile);
};

export { reconcileLearnerFromGenericImport };
