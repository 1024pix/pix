import { DomainTransaction } from '../../../../../lib/infrastructure/DomainTransaction.js';
import lodash from 'lodash';
const { isNil, uniq } = lodash;

import { MissingAttributesError, NotFoundError } from '../../../../../lib/domain/errors.js';
import { InvalidBadgeLevelError } from '../errors.js';
import { BadgeToAttach } from '../models/BadgeToAttach.js';

const attachBadges = async function ({
  complementaryCertificationId,
  userId,
  targetProfileIdToDetach,
  complementaryCertificationBadgesToAttachDTO,
  badgeRepository,
  complementaryCertificationForAdminRepository,
  complementaryCertificationBadgesRepository,
}) {
  _verifyThatLevelsAreConsistent({
    complementaryCertificationBadgesToAttachDTO,
  });

  await _verifyThatBadgesToAttachExist({
    complementaryCertificationBadgesToAttachDTO,
    badgeRepository,
  });

  const complementaryCertification = await complementaryCertificationForAdminRepository.getById({
    complementaryCertificationId,
  });

  if (_isComplementaryCertificationHasExternalJury({ complementaryCertification })) {
    if (_isRequiredInformationMissing(complementaryCertificationBadgesToAttachDTO))
      throw new MissingAttributesError(
        'Certificate and temporary certificate messages are required for complementary certification with external jury',
      );
  }

  const complementaryCertificationBadgesToAttach = complementaryCertificationBadgesToAttachDTO.map(
    (badgeToAttachDTO) => {
      const badgeToAttach = BadgeToAttach.from({
        ...badgeToAttachDTO,
        complementaryCertificationId,
        userId,
      });
      return badgeToAttach;
    },
  );

  return DomainTransaction.execute(async (domainTransaction) => {
    const relatedComplementaryCertificationBadgesIds =
      await complementaryCertificationBadgesRepository.getAllIdsByTargetProfileId({
        targetProfileId: targetProfileIdToDetach,
      });

    await _detachExistingComplementaryCertificationBadge({
      complementaryCertificationBadgesRepository,
      relatedComplementaryCertificationBadgesIds,
      domainTransaction,
    });

    for (const badgeToAttach of complementaryCertificationBadgesToAttach) {
      const complementaryCertificationBadge = BadgeToAttach.from({
        ...badgeToAttach,
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

export { attachBadges };

function _isRequiredInformationMissing(complementaryCertificationBadgesToAttachDTO) {
  return complementaryCertificationBadgesToAttachDTO.some(
    (complementaryCertificationBadge) =>
      isNil(complementaryCertificationBadge.certificateMessage) ||
      isNil(complementaryCertificationBadge.temporaryCertificateMessage),
  );
}

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

function _isComplementaryCertificationHasExternalJury({ complementaryCertification }) {
  return !!complementaryCertification.hasExternalJury;
}

async function _verifyThatBadgesToAttachExist({ complementaryCertificationBadgesToAttachDTO, badgeRepository }) {
  if (complementaryCertificationBadgesToAttachDTO?.length <= 0) {
    throw new NotFoundError("One or several badges don't exist.");
  }

  const ids = complementaryCertificationBadgesToAttachDTO.map((ccBadgeToAttach) => ccBadgeToAttach.badgeId);
  const badges = await badgeRepository.findAllByIds({ ids });

  if (badges?.length !== ids.length) {
    throw new NotFoundError("One or several badges don't exist.");
  }
}
