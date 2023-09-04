import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import uniq from 'lodash/uniq.js';

import { ComplementaryCertificationBadgeToAttach } from '../models/ComplementaryCertificationBadgeToAttach.js';
import { InvalidBadgeLevelError } from '../../../shared/domain/errors.js';

const attachBadgesToComplementaryCertification = async function ({
  complementaryCertificationId,
  userId,
  targetProfileId,
  complementaryCertificationBadgesToAttachDTO,
  badgeRepository,
  complementaryCertificationRepository,
  complementaryCertificationBadgesRepository,
}) {
  _verifyThatLevelsAreConsistent({
    complementaryCertificationBadgesToAttachDTO,
  });

  await _verifyThatComplementaryCertificationExists({
    complementaryCertificationId,
    complementaryCertificationRepository,
  });

  await _verifyThatBadgesToAttachExist({
    complementaryCertificationBadgesToAttachDTO,
    badgeRepository,
  });

  const complementaryCertificationBadgesToAttach = complementaryCertificationBadgesToAttachDTO.map(
    (complementaryCertificationBadgeToAttachDTO) => {
      const complementaryCertificationBadgeToAttach = ComplementaryCertificationBadgeToAttach.from({
        ...complementaryCertificationBadgeToAttachDTO,
        complementaryCertificationId,
        userId,
      });
      return complementaryCertificationBadgeToAttach;
    },
  );

  return DomainTransaction.execute(async (domainTransaction) => {
    const relatedComplementaryCertificationBadgesIds =
      await complementaryCertificationBadgesRepository.getAllIdsByTargetProfileId({
        targetProfileId,
      });

    await _detachExistingComplementaryCertificationBadge({
      complementaryCertificationBadgesRepository,
      relatedComplementaryCertificationBadgesIds,
      domainTransaction,
    });

    for (const complementaryCertificationBadgeToAttach of complementaryCertificationBadgesToAttach) {
      const complementaryCertificationBadge = ComplementaryCertificationBadgeToAttach.from({
        ...complementaryCertificationBadgeToAttach,
        complementaryCertificationId,
        userId,
      });
      await _attachNewComplementaryCertificationBadge({
        complementaryCertificationBadgesRepository,
        complementaryCertificationBadge,
        domainTransaction,
      });
    }
  });
};

export { attachBadgesToComplementaryCertification };

async function _attachNewComplementaryCertificationBadge({
  complementaryCertificationBadgesRepository,
  complementaryCertificationBadge,
  domainTransaction,
}) {
  await complementaryCertificationBadgesRepository.attach({
    complementaryCertificationBadge,
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

async function _verifyThatComplementaryCertificationExists({
  complementaryCertificationId,
  complementaryCertificationRepository,
}) {
  const complementaryCertification = await complementaryCertificationRepository.getById(complementaryCertificationId);
  if (!complementaryCertification) {
    throw new NotFoundError('The complementary certification does not exist');
  }
}

async function _verifyThatBadgesToAttachExist({ complementaryCertificationBadgesToAttachDTO, badgeRepository }) {
  if (complementaryCertificationBadgesToAttachDTO?.length <= 0) {
    throw new NotFoundError("One or several badges don't exist.");
  }

  const ids = complementaryCertificationBadgesToAttachDTO.map((ccBadgeToAttach) => ccBadgeToAttach.badgeId);
  const badges = await badgeRepository.findAllByIds(ids);

  if (badges?.length !== ids.length) {
    throw new NotFoundError("One or several badges don't exist.");
  }
}
