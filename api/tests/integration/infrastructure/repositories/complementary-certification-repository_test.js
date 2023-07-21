import { databaseBuilder, domainBuilder, expect } from "../../../test-helper.js";
import * as complementaryCertificationRepository
  from "../../../../lib/infrastructure/repositories/complementary-certification-repository.js";
import {
  ComplementaryCertificationForAdmin
} from "../../../../lib/domain/models/ComplementaryCertificationForAdmin.js";

describe('Integration | Repository | complementary-certification-repository', function () {
  describe('#findAll', function () {
    describe('when there are complementary certifications', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        databaseBuilder.factory.buildComplementaryCertification({
          id: 1,
          key: 'EDU_1ER_DEGRE',
          label: 'Pix+ Édu 1er degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 2,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 3,
          key: 'DROIT',
          label: 'Pix+ Droit',
        });
        databaseBuilder.factory.buildComplementaryCertification({
          id: 4,
          key: 'CLEA',
          label: 'CléA Numérique',
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        const expectedComplementaryCertifications = [
          domainBuilder.buildComplementaryCertification({
            id: 1,
            key: 'EDU_1ER_DEGRE',
            label: 'Pix+ Édu 1er degré',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 2,
            key: 'EDU_2ND_DEGRE',
            label: 'Pix+ Édu 2nd degré',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 3,
            key: 'DROIT',
            label: 'Pix+ Droit',
          }),
          domainBuilder.buildComplementaryCertification({
            id: 4,
            key: 'CLEA',
            label: 'CléA Numérique',
          }),
        ];

        expect(complementaryCertifications).to.deepEqualArray(expectedComplementaryCertifications);
      });
    });

    describe('when there are no complementary certification', function () {
      it('should return an empty array', async function () {
        // given when
        const complementaryCertifications = await complementaryCertificationRepository.findAll();

        // then
        expect(complementaryCertifications).to.be.empty;
      });
    });
  });

  describe('#getByLabel', function () {
    it('should return the complementary certification by its label', async function () {
      // given
      const label = 'Pix+ Édu 1er degré';
      databaseBuilder.factory.buildComplementaryCertification({
        id: 1,
        key: 'EDU_1ER_DEGRE',
        label,
      });

      databaseBuilder.factory.buildComplementaryCertification({
        id: 3,
        key: 'EDU_2ND_DEGRE',
        label: 'Pix+ Édu 2nd degré',
      });

      await databaseBuilder.commit();

      // when
      const complementaryCertification = await complementaryCertificationRepository.getByLabel({ label });

      // then
      const expectedComplementaryCertification = domainBuilder.buildComplementaryCertification({
        id: 1,
        key: 'EDU_1ER_DEGRE',
        label: 'Pix+ Édu 1er degré',
      });
      expect(complementaryCertification).to.deep.equal(expectedComplementaryCertification);
    });
  });

  describe('#getTargetProfileById', function () {
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

      const currentComplementaryCertificationBadgeId = _createComplementaryCertificationBadge({ targetProfileId: currentTarget.id, complementaryCertificationId: complementaryCertification.id, createdAt: new Date('2023-10-10'), label: 'badgeGood', level: 1}).id;
      const currentComplementaryCertificationBadgeId2 = _createComplementaryCertificationBadge({ targetProfileId: currentTarget.id, complementaryCertificationId: complementaryCertification.id, createdAt: new Date('2023-10-10'), label: 'badgeGood2', level: 1}).id;
      _createComplementaryCertificationBadge({ targetProfileId: oldTargetProfile.id, complementaryCertificationId: complementaryCertification.id, createdAt: new Date('2020-10-10'), label: 'oldBadge', level: 1}).id;

      await databaseBuilder.commit();

      // when
      const result = await complementaryCertificationRepository.getTargetProfileById({
        complementaryCertificationId: complementaryCertification.id,
      });

      // then
      expect(result).to.deepEqualInstance(
        new ComplementaryCertificationForAdmin({
          id: 3,
          key: 'EDU_2ND_DEGRE',
          label: 'Pix+ Édu 2nd degré',
          currentTargetProfile: {
            id: 999,
            name: 'currentTarget',
            badges: [
              {
                id: currentComplementaryCertificationBadgeId,
                level: 1,
                name: "badgeGood",
              },
              {
                id: currentComplementaryCertificationBadgeId2,
                level: 1,
                name: "badgeGood2",
              }
            ]
          },
        }),
      );
    });
  });
});

function _createComplementaryCertificationBadge({
  targetProfileId,
  complementaryCertificationId,
  createdAt,
  label,
  level
}) {
  const badgeId = databaseBuilder.factory.buildBadge({
    targetProfileId,
    key: label,
  }).id;

  return databaseBuilder.factory.buildComplementaryCertificationBadge({
    badgeId,
    complementaryCertificationId,
    createdAt,
    label,
    level,
  });
}
