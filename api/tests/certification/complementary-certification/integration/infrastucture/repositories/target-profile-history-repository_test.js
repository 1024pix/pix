import { ComplementaryCertificationBadgeForAdmin } from '../../../../../../lib/domain/models/ComplementaryCertificationBadgeForAdmin.js';
import { TargetProfileHistoryForAdmin } from '../../../../../../lib/domain/models/TargetProfileHistoryForAdmin.js';
import * as targetProfileHistoryRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/target-profile-history-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Repository | complementary-certification-target-profile-history-repository', function () {
  describe('#getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId', function () {
    describe('when there is only one current target profile associated to complementary certification', function () {
      it('should return the current target profile with badges', async function () {
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

        const currentCCBadge2 = _createComplementaryCertificationBadge({
          targetProfileId: currentTarget.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'goodBadge2',
          level: 2,
          imageUrl: 'http://good-badge-2-url.net',
          minimumEarnedPix: 20,
        });
        const currentCCBadge = _createComplementaryCertificationBadge({
          targetProfileId: currentTarget.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'goodBadge',
          level: 1,
          imageUrl: 'http://good-badge-url.net',
          minimumEarnedPix: 10,
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
        const result =
          await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId({
            complementaryCertificationId: complementaryCertification.id,
          });

        // then
        expect(result).to.deepEqualInstance([
          new TargetProfileHistoryForAdmin({
            id: 999,
            name: 'currentTarget',
            attachedAt: new Date('2023-10-10'),
            detachedAt: null,
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge.badgeId,
                complementaryCertificationBadgeId: currentCCBadge.id,
                level: 1,
                label: 'goodBadge',
                imageUrl: 'http://good-badge-url.net',
                minimumEarnedPix: 10,
              }),
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge2.badgeId,
                complementaryCertificationBadgeId: currentCCBadge2.id,
                level: 2,
                label: 'goodBadge2',
                imageUrl: 'http://good-badge-2-url.net',
                minimumEarnedPix: 20,
              }),
            ],
          }),
        ]);
      });
    });

    describe('when there is more than one current target profile associated to complementary certification', function () {
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

        const currentTargetProfile = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'currentTarget' });

        const anotherCurrentTargetProfile = databaseBuilder.factory.buildTargetProfile({
          id: 222,
          name: 'anotherCurrentTarget',
        });

        const currentCCBadge = _createComplementaryCertificationBadge({
          targetProfileId: currentTargetProfile.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'badgeGood',
          level: 1,
          minimumEarnedPix: 40,
        });
        const currentCCBadge2 = _createComplementaryCertificationBadge({
          targetProfileId: currentTargetProfile.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'badgeGood2',
          level: 1,
          minimumEarnedPix: 50,
        });
        const currentCCBadge3 = _createComplementaryCertificationBadge({
          targetProfileId: anotherCurrentTargetProfile.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2020-10-10'),
          label: 'anotherCurrentBadge',
          level: 1,
          minimumEarnedPix: 60,
        });

        await databaseBuilder.commit();

        // when
        const result =
          await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId({
            complementaryCertificationId: complementaryCertification.id,
          });

        // then
        expect(result).to.deepEqualInstance([
          new TargetProfileHistoryForAdmin({
            id: 999,
            name: 'currentTarget',
            attachedAt: new Date('2023-10-10'),
            detachedAt: null,
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge.badgeId,
                complementaryCertificationBadgeId: currentCCBadge.id,
                level: 1,
                label: 'badgeGood',
                imageUrl: 'http://badge-image-url.fr',
                minimumEarnedPix: 40,
              }),
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge2.badgeId,
                complementaryCertificationBadgeId: currentCCBadge2.id,
                level: 1,
                label: 'badgeGood2',
                imageUrl: 'http://badge-image-url.fr',
                minimumEarnedPix: 50,
              }),
            ],
          }),
          new TargetProfileHistoryForAdmin({
            id: 222,
            name: 'anotherCurrentTarget',
            attachedAt: new Date('2020-10-10'),
            detachedAt: null,
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge3.badgeId,
                complementaryCertificationBadgeId: currentCCBadge3.id,
                level: 1,
                label: 'anotherCurrentBadge',
                imageUrl: 'http://badge-image-url.fr',
                minimumEarnedPix: 60,
              }),
            ],
          }),
        ]);
      });
    });

    describe('when there are badges without complementary certification badge', function () {
      it('should return the current target profile with only the badges associated with complementary certification badges', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 3,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
        });

        const currentTarget = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'currentTarget' });

        databaseBuilder.factory.buildBadge({
          targetProfileId: currentTarget.id,
          key: 'badge sans ccbadge',
        });

        const currentCCBadge2 = _createComplementaryCertificationBadge({
          targetProfileId: currentTarget.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'goodBadge2',
          level: 2,
          imageUrl: 'http://good-badge-2-url.net',
          minimumEarnedPix: 80,
        });
        const currentCCBadge = _createComplementaryCertificationBadge({
          targetProfileId: currentTarget.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2023-10-10'),
          label: 'goodBadge',
          level: 1,
          imageUrl: 'http://good-badge-url.net',
          minimumEarnedPix: 70,
        });

        await databaseBuilder.commit();

        // when
        const result =
          await targetProfileHistoryRepository.getCurrentTargetProfilesHistoryWithBadgesByComplementaryCertificationId({
            complementaryCertificationId: complementaryCertification.id,
          });

        // then
        expect(result).to.deepEqualInstance([
          new TargetProfileHistoryForAdmin({
            id: 999,
            name: 'currentTarget',
            attachedAt: new Date('2023-10-10'),
            detachedAt: null,
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge.badgeId,
                complementaryCertificationBadgeId: currentCCBadge.id,
                level: 1,
                label: 'goodBadge',
                imageUrl: 'http://good-badge-url.net',
                minimumEarnedPix: 70,
              }),
              new ComplementaryCertificationBadgeForAdmin({
                id: currentCCBadge2.badgeId,
                complementaryCertificationBadgeId: currentCCBadge2.id,
                level: 2,
                label: 'goodBadge2',
                imageUrl: 'http://good-badge-2-url.net',
                minimumEarnedPix: 80,
              }),
            ],
          }),
        ]);
      });
    });
  });

  describe('#getDetachedTargetProfilesHistoryByComplementaryCertificationId', function () {
    describe('when there is no previous attached target profiles', function () {
      it('should return an empty list', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'EDU_1ER_DEGRE',
          label: 'Pix+ Édu 1er degré',
        });

        const currentTarget = databaseBuilder.factory.buildTargetProfile({ id: 999, name: 'currentTarget' });

        _createComplementaryCertificationBadge({
          targetProfileId: currentTarget.id,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2020-10-10'),
          label: 'badge',
          level: 1,
          detachedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const result =
          await targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId({
            complementaryCertificationId: complementaryCertification.id,
          });

        // then
        expect(result).to.be.empty;
      });
    });

    describe('when there are detached target profiles', function () {
      it('should return ordered target profile history', async function () {
        // given
        const complementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'EDU_2ND_DEGRE',
        });
        databaseBuilder.factory.buildTargetProfile({ id: '2', name: 'target profile v1' });
        const badgeId = databaseBuilder.factory.buildBadge({
          targetProfileId: '2',
          key: 'labelBadge',
        }).id;
        const ccBadgeTargetProfile2_lvl1 = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2019-05-01'),
          detachedAt: new Date('2020-05-01'),
          label: 'cc badge current',
          level: 1,
        });

        const badgeId2 = databaseBuilder.factory.buildBadge({
          targetProfileId: '2',
          key: 'labelBadge 2',
        }).id;
        const ccBadgeTargetProfile2_lvl2 = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badgeId2,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2019-05-01'),
          detachedAt: new Date('2020-05-01'),
          label: 'cc badge current 2',
          level: 2,
        });

        databaseBuilder.factory.buildTargetProfile({ id: '3', name: 'target profile v3' });
        const badgeId3 = databaseBuilder.factory.buildBadge({
          targetProfileId: '3',
          key: 'labelBadge 3',
        }).id;
        const ccBadgeTargetProfile3 = databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badgeId3,
          complementaryCertificationId: complementaryCertification.id,
          createdAt: new Date('2019-09-01'),
          detachedAt: new Date('2019-09-01'),
          label: 'cclabel 3',
          level: 1,
        });

        _createAnotherComplementaryCertificationWithTargetProfileAndBadge();

        await databaseBuilder.commit();

        // when
        const result =
          await targetProfileHistoryRepository.getDetachedTargetProfilesHistoryByComplementaryCertificationId({
            complementaryCertificationId: complementaryCertification.id,
          });

        // then
        expect(result).to.deepEqualInstance([
          new TargetProfileHistoryForAdmin({
            id: 3,
            name: 'target profile v3',
            attachedAt: new Date('2019-09-01'),
            detachedAt: new Date('2019-09-01'),
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: ccBadgeTargetProfile3.badgeId,
                complementaryCertificationBadgeId: ccBadgeTargetProfile3.id,
                level: ccBadgeTargetProfile3.level,
                label: ccBadgeTargetProfile3.label,
                imageUrl: ccBadgeTargetProfile3.imageUrl,
                minimumEarnedPix: ccBadgeTargetProfile3.minimumEarnedPix,
              }),
            ],
          }),
          new TargetProfileHistoryForAdmin({
            id: 2,
            name: 'target profile v1',
            attachedAt: new Date('2019-05-01'),
            detachedAt: new Date('2020-05-01'),
            badges: [
              new ComplementaryCertificationBadgeForAdmin({
                id: ccBadgeTargetProfile2_lvl1.badgeId,
                complementaryCertificationBadgeId: ccBadgeTargetProfile2_lvl1.id,
                level: ccBadgeTargetProfile2_lvl1.level,
                label: ccBadgeTargetProfile2_lvl1.label,
                imageUrl: ccBadgeTargetProfile2_lvl1.imageUrl,
                minimumEarnedPix: ccBadgeTargetProfile2_lvl1.minimumEarnedPix,
              }),
              new ComplementaryCertificationBadgeForAdmin({
                id: ccBadgeTargetProfile2_lvl2.badgeId,
                complementaryCertificationBadgeId: ccBadgeTargetProfile2_lvl2.id,
                level: ccBadgeTargetProfile2_lvl2.level,
                label: ccBadgeTargetProfile2_lvl2.label,
                imageUrl: ccBadgeTargetProfile2_lvl2.imageUrl,
                minimumEarnedPix: ccBadgeTargetProfile2_lvl2.minimumEarnedPix,
              }),
            ],
          }),
        ]);
      });
    });

    function _createAnotherComplementaryCertificationWithTargetProfileAndBadge() {
      const otherComplementaryCertification = databaseBuilder.factory.buildComplementaryCertification({
        id: 2,
        key: 'EDU_3E_DEGRE',
      });
      const targetProfileId = 1000;

      databaseBuilder.factory.buildTargetProfile({ id: targetProfileId, name: 'otherTarget' });
      _createComplementaryCertificationBadge({
        targetProfileId: targetProfileId,
        complementaryCertificationId: otherComplementaryCertification.id,
        createdAt: new Date('2022-06-01'),
        detachedAt: new Date('2022-06-01'),
        label: 'otherBadge',
        level: 1,
      });
    }
  });
});

function _createComplementaryCertificationBadge({
  targetProfileId,
  complementaryCertificationId,
  createdAt,
  detachedAt,
  label,
  level,
  imageUrl,
  minimumEarnedPix,
}) {
  const badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
    key: label,
  }).id;

  return databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId,
    complementaryCertificationId,
    createdAt,
    detachedAt,
    label,
    level,
    imageUrl,
    minimumEarnedPix,
  });
}
