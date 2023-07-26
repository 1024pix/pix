import { databaseBuilder, expect } from '../../../test-helper.js';
import * as complementaryCertificationTargetProfileHistoryRepository from '../../../../lib/infrastructure/repositories/complementary-certification-target-profile-history-repository.js';
import { ComplementaryCertificationTargetProfileHistory } from '../../../../lib/domain/models/ComplementaryCertificationTargetProfileHistory.js';

describe('Integration | Repository | complementary-certification-target-profile-history-repository', function () {
  describe('#getByComplementaryCertificationId', function () {
    it('should return the complementary certification and current target profile with badges', async function () {
      // given
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });

      const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        key: 'EDU_2ND_DEGRE',
        label: 'Pix+ Édu 2nd degré',
      });

      const currentTarget = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'currentTarget' });

      const oldTargetProfile = databaseBuilder.factory.buildTargetProfile({ id: 222, name: 'oldTarget' });

      const currentBadgeId = _createComplementaryCertificationBadge({
        targetProfileId: currentTarget.id,
        complementaryCertificationId: complementaryCertification.id,
        createdAt: new Date('2023-10-10'),
        label: 'badgeGood',
        level: 1,
      });
      const currentBadgeId2 = _createComplementaryCertificationBadge({
        targetProfileId: currentTarget.id,
        complementaryCertificationId: complementaryCertification.id,
        createdAt: new Date('2023-10-10'),
        label: 'badgeGood2',
        level: 1,
      });
      _createComplementaryCertificationBadge({
        targetProfileId: oldTargetProfile.id,
        complementaryCertificationId: complementaryCertification.id,
        createdAt: new Date('2020-10-10'),
        label: 'oldBadge',
        level: 1,
        detachedAt: new Date('2021-10-10'),
      });

      await databaseBuilder.commit();

      // when
      const result = await complementaryCertificationTargetProfileHistoryRepository.getByComplementaryCertificationId({
        complementaryCertificationId: complementaryCertification.id,
      });

      // then
      expect(result).to.deepEqualInstance(
        new ComplementaryCertificationTargetProfileHistory({
          id: 3,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
          targetProfilesHistory: [
            { id: 999, name: 'currentTarget', attachedAt: new Date('2023-10-10'), detachedAt: null },
            { id: 222, name: 'oldTarget', attachedAt: new Date('2020-10-10'), detachedAt: new Date('2021-10-10') },
          ],
          currentTargetProfileBadges: [
            {
              id: currentBadgeId,
              level: 1,
              label: 'badgeGood',
            },
            {
              id: currentBadgeId2,
              level: 1,
              label: 'badgeGood2',
            },
          ],
        }),
      );
    });
  });
});

function _createComplementaryCertificationBadge({
  targetProfileId,
  complementaryCertificationId,
  createdAt,
  detachedAt,
  label,
  level,
}) {
  const badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
    key: label,
  }).id;

  databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId,
    complementaryCertificationId,
    createdAt,
    detachedAt,
    label,
    level,
  });

  return badgeId;
}
