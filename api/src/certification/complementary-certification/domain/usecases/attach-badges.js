import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import lodash from 'lodash';
import { MissingAttributesError, NotFoundError } from '../../../../../lib/domain/errors.js';
import { InvalidBadgeLevelError } from '../errors.js';
import { BadgeToAttach } from '../models/BadgeToAttach.js';

const { isNil, uniq } = lodash;

const attachBadges = async function ({
  complementaryCertification,
  userId,
  targetProfileIdToDetach,
  complementaryCertificationBadgesToAttachDTO,
  complementaryCertificationBadgesRepository,
}) {
  _verifyThatLevelsAreConsistent({
    complementaryCertificationBadgesToAttachDTO,
  });

  await _verifyThatBadgesToAttachExist({
    complementaryCertificationBadgesToAttachDTO,
    complementaryCertificationBadgesRepository,
  });

  if (complementaryCertification.hasExternalJury) {
    if (_isRequiredInformationMissing(complementaryCertificationBadgesToAttachDTO))
      throw new MissingAttributesError(
        'Certificate and temporary certificate messages are required for complementary certification with external jury',
      );
  }

  const complementaryCertificationBadges = complementaryCertificationBadgesToAttachDTO.map((badgeToAttachDTO) => {
    return BadgeToAttach.from({
      ...badgeToAttachDTO,
      complementaryCertificationId: complementaryCertification.id,
      userId,
    });
  });

  await DomainTransaction.execute(async (domainTransaction) => {
    const relatedComplementaryCertificationBadgesIds =
      await complementaryCertificationBadgesRepository.getAllIdsByTargetProfileId({
        targetProfileId: targetProfileIdToDetach,
      });

    await _detachExistingComplementaryCertificationBadge({
      complementaryCertificationBadgesRepository,
      relatedComplementaryCertificationBadgesIds,
      domainTransaction,
    });

    await _attachNewComplementaryCertificationBadges({
      complementaryCertificationBadgesRepository,
      complementaryCertificationBadges,
      domainTransaction,
    });
  });
};

export { attachBadges };

function _isRequiredInformationMissing(complementaryCertificationBadgesToAttachDTO) {
  return complementaryCertificationBadgesToAttachDTO.some(
    (complementaryCertificationBadge) =>
      isNil(complementaryCertificationBadge.certificateMessage) ||
      isNil(complementaryCertificationBadge.temporaryCertificateMessage),
  );
}

async function _attachNewComplementaryCertificationBadges({
  complementaryCertificationBadgesRepository,
  complementaryCertificationBadges,
  domainTransaction,
}) {
  await complementaryCertificationBadgesRepository.attach({
    complementaryCertificationBadges,
    domainTransaction,
  });
}

async function _detachExistingComplementaryCertificationBadge({
  complementaryCertificationBadgesRepository,
  relatedComplementaryCertificationBadgesIds,
  domainTransaction,
}) {
  if (relatedComplementaryCertificationBadgesIds.length === 0) {
    throw new NotFoundError('No badges for this target profile.');
  }

  await complementaryCertificationBadgesRepository.detachByIds({
    complementaryCertificationBadgeIds: relatedComplementaryCertificationBadgesIds,
    domainTransaction,
  });
}

function _compareLevels(level1, level2) {
  return level1 - level2;
}

function _ifLevelIsUniq({ sortedUniqLevels, complementaryCertificationBadgesToAttachDTO }) {
  return sortedUniqLevels.length == complementaryCertificationBadgesToAttachDTO.length;
}

function _isFirstLevelDifferentThanOne(sortedUniqLevels) {
  return sortedUniqLevels[0] !== 1;
}

function _isLastLevelDifferentThanExpectedMaximum({ sortedUniqLevels, complementaryCertificationBadgesToAttachDTO }) {
  return sortedUniqLevels.at(-1) !== complementaryCertificationBadgesToAttachDTO.length;
}

function _verifyThatLevelsAreConsistent({ complementaryCertificationBadgesToAttachDTO }) {
  const extractedLevelsFromBadges =
    complementaryCertificationBadgesToAttachDTO?.map((badge) => badge.level).filter(Number.isInteger) ?? [];
  const sortedUniqLevels = uniq([...extractedLevelsFromBadges]).sort(_compareLevels);
  if (!_ifLevelIsUniq({ sortedUniqLevels, complementaryCertificationBadgesToAttachDTO })) {
    throw new InvalidBadgeLevelError();
  }

  if (_isFirstLevelDifferentThanOne(sortedUniqLevels)) {
    throw new InvalidBadgeLevelError();
  }

  if (_isLastLevelDifferentThanExpectedMaximum({ sortedUniqLevels, complementaryCertificationBadgesToAttachDTO })) {
    throw new InvalidBadgeLevelError();
  }
}

async function _verifyThatBadgesToAttachExist({
  complementaryCertificationBadgesToAttachDTO,
  complementaryCertificationBadgesRepository,
}) {
  if (complementaryCertificationBadgesToAttachDTO?.length <= 0) {
    throw new NotFoundError('One or several badges are not attachable.');
  }

  const ids = complementaryCertificationBadgesToAttachDTO.map((ccBadgeToAttach) => ccBadgeToAttach.badgeId);
  const badges = await complementaryCertificationBadgesRepository.findAttachableBadgesByIds({ ids });

  if (badges?.length !== ids.length) {
    throw new NotFoundError('One or several badges are not attachable.');
  }
}
