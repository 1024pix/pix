import * as complementaryCertificationBadgeWithOffsetVersionRepository from '../../../../../../src/certification/enrolment/infrastructure/repositories/complementary-certification-badge-with-offset-version-repository.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Enrolment | Integration | Repository | complementary-certification-badge-with-offset-version-repository', function () {
  describe('#getAllWithSameTargetProfile', function () {
    it('should return all complementary certification badges with offset version for the same target profile', async function () {
      // given
      const { id: targetProfileId1 } = databaseBuilder.factory.buildTargetProfile();
      const { id: targetProfileId2 } = databaseBuilder.factory.buildTargetProfile();

      const { id: badgeId1 } = databaseBuilder.factory.buildBadge({ targetProfileId1 });
      const { id: badgeId2 } = databaseBuilder.factory.buildBadge({ targetProfileId2 });

      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification({ key: 'key1' }).id;
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 1,
        minimumEarnedPix: 150,
        badgeId: badgeId1,
        level: 2,
        complementaryCertificationId,
        label: 'Pix+ toto FI confirmé',
        imageUrl: 'Pix+-toto-FI-confirmé.fr',
        detachedAt: '2020-01-01',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 4,
        badgeId: badgeId1,
        level: 2,
        label: 'Pix+ toto FI confirmé',
        imageUrl: 'Pix+-toto-FI-confirmé.fr',
        minimumEarnedPix: 150,
        complementaryCertificationId,
      });

      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 5,
        minimumEarnedPix: null,
        badgeId: badgeId2,
        label: 'Pix+ toto FC confirmé',
        imageUrl: 'Pix+-toto-FC-confirmé.fr',
        level: 2,
        complementaryCertificationId,
        detachedAt: '2020-01-01',
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 6,
        minimumEarnedPix: 150,
        badgeId: badgeId2,
        label: 'Pix+ toto FC confirmé',
        imageUrl: 'Pix+-toto-FC-confirmé.fr',
        level: 2,
        complementaryCertificationId,
      });
      databaseBuilder.factory.buildComplementaryCertificationBadge({
        id: 7,
        minimumEarnedPix: 300,
        badgeId: badgeId2,
        label: 'Pix+ toto FC expert',
        imageUrl: 'Pix+-toto-FC-expert.fr',
        level: 3,
        complementaryCertificationId,
      });

      await databaseBuilder.commit();

      // when
      const actualComplementaryCertificationBadges =
        await complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile({
          complementaryCertificationBadgeId: 6,
        });

      // then
      const expectedResult = [
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 5,
          requiredPixScore: 0,
          level: 2,
          offsetVersion: 1,
          label: 'Pix+ toto FC confirmé',
          imageUrl: 'Pix+-toto-FC-confirmé.fr',
          isOutdated: true,
          currentAttachedComplementaryCertificationBadgeId: 6,
        }),
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 6,
          requiredPixScore: 150,
          level: 2,
          offsetVersion: 0,
          label: 'Pix+ toto FC confirmé',
          imageUrl: 'Pix+-toto-FC-confirmé.fr',
          isOutdated: false,
          currentAttachedComplementaryCertificationBadgeId: 6,
        }),
        domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
          id: 7,
          requiredPixScore: 300,
          level: 3,
          offsetVersion: 0,
          label: 'Pix+ toto FC expert',
          imageUrl: 'Pix+-toto-FC-expert.fr',
          isOutdated: false,
          currentAttachedComplementaryCertificationBadgeId: 7,
        }),
      ];
      expect(actualComplementaryCertificationBadges).to.have.deep.members(expectedResult);
    });

    it('should return empty array when there are none', async function () {
      // when
      const actualComplementaryCertificationBadges =
        await complementaryCertificationBadgeWithOffsetVersionRepository.getAllWithSameTargetProfile({
          complementaryCertificationBadgeId: 6,
        });

      // then
      expect(actualComplementaryCertificationBadges).to.deepEqualArray([]);
    });
  });
});
