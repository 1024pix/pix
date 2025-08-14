/**
 * @typedef {import ('../../domain/usecases/index.js').TargetProfileHistoryRepository} TargetProfileHistoryRepository
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationForTargetProfileAttachmentRepository} ComplementaryCertificationForTargetProfileAttachmentRepository
 */
import * as injectedTargetProfileHistoryRepository from '../../../shared/infrastructure/repositories/target-profile-history-repository.js';
import * as injectedComplementaryCertificationForTargetProfileAttachmentRepository from '../../infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import { ComplementaryCertificationTargetProfileHistory } from '../models/ComplementaryCertificationTargetProfileHistory.js';

/**
 * @param {Object} params
 * @param {number} params.complementaryCertificationId
 * @param {TargetProfileHistoryRepository} params.targetProfileHistoryRepository
 * @param {ComplementaryCertificationForTargetProfileAttachmentRepository} params.complementaryCertificationForTargetProfileAttachmentRepository
 *
 * @returns {Promise<ComplementaryCertificationTargetProfileHistory>} all target profiles than were applicable for this complementary certification
 */
const getComplementaryCertificationTargetProfileHistory = async function ({
  complementaryCertificationId,
  targetProfileHistoryRepository = injectedTargetProfileHistoryRepository,
  complementaryCertificationForTargetProfileAttachmentRepository = injectedComplementaryCertificationForTargetProfileAttachmentRepository,
} = {}) {
  const currentsTargetProfileHistoryWithBadgesByComplementaryCertification =
    await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId({
      complementaryCertificationId,
    });

  const detachedTargetProfileHistoryByComplementaryCertification =
    await targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId({
      complementaryCertificationId,
    });

  const complementaryCertification = await complementaryCertificationForTargetProfileAttachmentRepository.getById({
    complementaryCertificationId,
  });

  return new ComplementaryCertificationTargetProfileHistory({
    ...complementaryCertification,
    targetProfilesHistory: [
      ...currentsTargetProfileHistoryWithBadgesByComplementaryCertification,
      ...detachedTargetProfileHistoryByComplementaryCertification,
    ],
  });
};

export { getComplementaryCertificationTargetProfileHistory };
