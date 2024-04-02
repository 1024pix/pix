/**
 * @typedef {import ('../../domain/usecases/index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationCourseRepository} ComplementaryCertificationCourseRepository
 * @typedef {import ('../../domain/usecases/index.js').ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import ('../../domain/usecases/index.js').PlacementProfileService} PlacementProfileService
 * @typedef {import ('../models/CertifiableBadgeAcquisition.js').CertifiableBadgeAcquisition} CertifiableBadgeAcquisition
 * @typedef {import ('../../../src/certification/complementary-certification/domain/read-models/ComplementaryCertificationVersioning.js').ComplementaryCertificationVersioning} ComplementaryCertificationVersioning
 */

/**
 * @typedef {Object} ComplementaryCertificationsEligibles
 * @property {string} label
 * @property {string} imageUrl
 * @property {boolean} isOutdated
 * @property {boolean} isAcquired
 */

import _ from 'lodash';

import { ComplementaryCertificationBadgesHistory } from '../../../src/certification/complementary-certification/application/api/models/ComplementaryCertificationBadgesHistory.js';
import {
  ComplementaryCertificationBadge,
  ComplementaryCertificationVersioning,
} from '../../../src/certification/complementary-certification/domain/read-models/ComplementaryCertificationVersioning.js';
import { config } from '../../config.js';
import { CertificationEligibility } from '../read-models/CertificationEligibility.js';

/**
 * @param {Object} params
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {ComplementaryCertificationCourseRepository} params.complementaryCertificationCourseRepository
 * @param {TargetProfileHistoryRepository} params.targetProfileHistoryRepository
 * @param {PlacementProfileService} params.placementProfileService
 *
 * @returns {CertificationEligibility}
 */
const getUserCertificationEligibility = async function ({
  userId,
  limitDate = new Date(),
  placementProfileService,
  certificationBadgesService,
  complementaryCertificationCourseRepository,
  targetProfileHistoryRepository,
}) {
  const placementProfile = await placementProfileService.getPlacementProfile({ userId, limitDate });
  const pixCertificationEligible = placementProfile.isCertifiable();

  if (!pixCertificationEligible) {
    return CertificationEligibility.notCertifiable({ userId });
  }

  const complementaryCertificationsEligibles = await _getComplementaryCertificationsEligibles({
    certificationBadgesService,
    userId,
    limitDate,
    complementaryCertificationCourseRepository,
    targetProfileHistoryRepository,
  });

  return new CertificationEligibility({
    id: userId,
    pixCertificationEligible,
    complementaryCertifications: complementaryCertificationsEligibles,
  });
};

export { getUserCertificationEligibility };

/**
 * @param {Object} params
 * @param {CertifiableBadgeAcquisition} params.certifiableBadgeAcquisition
 * @param {TargetProfileHistoryRepository} params.targetProfileHistoryRepository
 * @returns {Array<number>} - complementaryCertificationBadgeIds
 */
const _getComplementaryCertificationVersioningForOutdatedBadge = async ({
  certifiableBadgeAcquisition,
  targetProfileHistoryRepository,
}) => {
  if (certifiableBadgeAcquisition.isOutdated) {
    const targetProfileHistory = await _getTargetProfileHistory({
      targetProfileHistoryRepository,
      certifiableBadgeAcquisition,
    });

    const complementaryCertificationBadgesHistories = _getComplementaryCertificationBadgesHistories({
      targetProfileHistory,
    });

    const complementaryVersioning = _toComplementaryCertificationVersioning({
      complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
      complementaryCertificationBadgesHistories,
    });

    return _.chain(complementaryVersioning.complementaryCertificationBadges)
      .filter(({ deactivationDate }) => !!deactivationDate)
      .groupBy('deactivationDate')
      .values()
      .value();
  }

  return [];
};

/**
 * @param {Object} params
 * @param {number} params.stillValidBadgeAcquisitionComplementaryCertificationBadgeId
 * @param {Array<number>} params.outdatedVersions
 * @returns {Boolean}
 */
const _isOutdatedBadgeAcquisitionByMoreThanOneVersion = ({
  stillValidBadgeAcquisitionComplementaryCertificationBadgeId,
  outdatedVersions,
}) => {
  if (!outdatedVersions.length) {
    return false;
  }
  const lastOutedVersion = outdatedVersions[0];
  const isBadgeAcquisitionFoundInPreviousVersion = lastOutedVersion.some(
    ({ id }) => id === stillValidBadgeAcquisitionComplementaryCertificationBadgeId,
  );
  return outdatedVersions.length > 1 && !isBadgeAcquisitionFoundInPreviousVersion;
};

/**
 * @param {Object} params
 * @param {number} params.complementaryCertificationId
 * @param {Array<ComplementaryCertificationBadgesHistory>} params.complementaryCertificationBadgesHistories
 * @returns {ComplementaryCertificationVersioning}
 */
const _toComplementaryCertificationVersioning = ({
  complementaryCertificationId,
  complementaryCertificationBadgesHistories,
}) => {
  const complementaryCertificationBadges = complementaryCertificationBadgesHistories.flatMap(
    (complementaryCertificationBadgesHistory) => {
      return complementaryCertificationBadgesHistory.complementaryCertificationBadgeIds.map(
        (complementaryCertificationBadgeId) => {
          return new ComplementaryCertificationBadge({
            ...complementaryCertificationBadgesHistory,
            id: complementaryCertificationBadgeId,
          });
        },
      );
    },
  );

  return new ComplementaryCertificationVersioning({ complementaryCertificationId, complementaryCertificationBadges });
};

/**
 * @param {Object} params
 * @param {Array<Object>} params.targetProfileHistory
 * @returns {ComplementaryCertificationBadgesHistory}
 */
function _getComplementaryCertificationBadgesHistories({ targetProfileHistory }) {
  return targetProfileHistory.map((complementaryCertificationBadge) => {
    const complementaryCertificationBadgeIds = complementaryCertificationBadge.badges.map(
      ({ complementaryCertificationBadgeId }) => complementaryCertificationBadgeId,
    );

    return new ComplementaryCertificationBadgesHistory({
      complementaryCertificationBadgeIds,
      activationDate: complementaryCertificationBadge.attachedAt,
      deactivationDate: complementaryCertificationBadge.detachedAt,
    });
  });
}

async function _getTargetProfileHistory({ targetProfileHistoryRepository, certifiableBadgeAcquisition }) {
  const currentTargetProfilesHistoryWithBadges =
    await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId({
      complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
    });

  const detachedTargetProfilesHistory =
    await targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId({
      complementaryCertificationId: certifiableBadgeAcquisition.complementaryCertificationId,
    });

  const targetProfileHistory = [...currentTargetProfilesHistoryWithBadges, ...detachedTargetProfilesHistory];
  return targetProfileHistory;
}

/**
 * @param {Object} params
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {number} params.userId
 * @param {date} params.limitDate
 * @param {complementaryCertificationCourseRepository} params.complementaryCertificationCourseRepository
 * @param {TargetProfileHistoryRepository} params.targetProfileHistoryRepository
 * @returns {Array<ComplementaryCertificationsEligibles>}
 */
async function _getComplementaryCertificationsEligibles({
  certificationBadgesService,
  userId,
  limitDate,
  complementaryCertificationCourseRepository,
  targetProfileHistoryRepository,
}) {
  const stillValidBadgeAcquisitions = await certificationBadgesService.findLatestBadgeAcquisitions({
    userId,
    limitDate,
  });

  const complementaryCertificationsTakenByUser = await complementaryCertificationCourseRepository.findByUserId({
    userId,
  });

  const acquiredComplementaryCertifications = complementaryCertificationsTakenByUser.filter(
    (complementaryCertification) => complementaryCertification.isAcquiredByPixSource(),
  );

  const complementaryCertificationsEligibles = [];
  for (const stillValidBadgeAcquisition of stillValidBadgeAcquisitions) {
    const stillValidBadgeAcquisitionComplementaryCertificationBadgeId =
      stillValidBadgeAcquisition.complementaryCertificationBadgeId;

    const stillValidAcquiredComplementaryCertification = acquiredComplementaryCertifications.find(
      ({ complementaryCertificationBadgeId }) =>
        complementaryCertificationBadgeId === stillValidBadgeAcquisition.complementaryCertificationBadgeId,
    );

    const complementaryCertificationVersioning = await _getComplementaryCertificationVersioningForOutdatedBadge({
      certifiableBadgeAcquisition: stillValidBadgeAcquisition,
      targetProfileHistoryRepository,
    });

    if (
      stillValidBadgeAcquisition.isOutdated &&
      _isAcquiredByPixSourceOrOutdatedByMoreThanOneVersion({
        stillValidBadgeAcquisitionComplementaryCertificationBadgeId,
        complementaryCertificationVersioning,
        stillValidAcquiredComplementaryCertification,
      })
    ) {
      continue;
    }

    const isAcquired = acquiredComplementaryCertifications.some(
      ({ complementaryCertificationBadgeId }) =>
        complementaryCertificationBadgeId === stillValidBadgeAcquisition.complementaryCertificationBadgeId,
    );
    complementaryCertificationsEligibles.push({
      label: stillValidBadgeAcquisition.complementaryCertificationBadgeLabel,
      imageUrl: stillValidBadgeAcquisition.complementaryCertificationBadgeImageUrl,
      isOutdated: stillValidBadgeAcquisition.isOutdated,
      isAcquired,
    });
  }
  return complementaryCertificationsEligibles;
}

function _isAcquiredByPixSourceOrOutdatedByMoreThanOneVersion({
  stillValidBadgeAcquisitionComplementaryCertificationBadgeId,
  complementaryCertificationVersioning,
  stillValidAcquiredComplementaryCertification,
}) {
  return (
    // TODO: Remove check on isPixPlusLowerLeverEnabled if enabled in PROD
    (config.featureToggles.isPixPlusLowerLeverEnabled &&
      _isOutdatedBadgeAcquisitionByMoreThanOneVersion({
        stillValidBadgeAcquisitionComplementaryCertificationBadgeId,
        outdatedVersions: complementaryCertificationVersioning,
      })) ||
    stillValidAcquiredComplementaryCertification?.isAcquiredExpectedLevelByPixSource()
  );
}
