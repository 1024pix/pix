import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/shared/infrastructure/repositories/complementary-certification-badge-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { catchErr, databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Integration | Infrastructure | Repository | Certification | Shared | complementary-certification-badge-repository', function () {
  context('#getAllWithSameTargetProfile', function () {
    context(
      'when some complementary certification badges are tied to the complementary certification badge id',
      function () {
        it('should return all badges obtainable on the same target profile', async function () {
          // given
          const { id: targetProfileId } = databaseBuilder.factory.buildTargetProfile();

          const userId = databaseBuilder.factory.buildUser().id;

          const { id: badgeId1, imageUrl: imageUrl1 } = databaseBuilder.factory.buildBadge({ targetProfileId });
          const { id: badgeId2, imageUrl: imageUrl2 } = databaseBuilder.factory.buildBadge({ targetProfileId });
          const { id: complementaryCertificationId } = databaseBuilder.factory.buildComplementaryCertification({
            key: 'kiki',
          });

          const ccBadge1 = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId: badgeId1,
            level: 1,
            minimumEarnedPix: 60,
            createdAt: new Date('2020-01-01'),
            imageUrl: imageUrl1,
            label: 'Label badge 1',
            certificateMessage: 'top',
            temporaryCertificateMessage: 'coucou',
            stickerUrl: 'http://stiker-url.fr',
            detachedAt: null,
            createdBy: userId,
            complementaryCertificationId,
          });
          const ccBadge2 = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId: badgeId2,
            level: 2,
            minimumEarnedPix: 80,
            createdAt: new Date('2020-01-01'),
            imageUrl: imageUrl2,
            label: 'Label badge 2',
            certificateMessage: 'top',
            temporaryCertificateMessage: 'coucou',
            stickerUrl: 'http://stiker-url.fr',
            detachedAt: null,
            createdBy: userId,
            complementaryCertificationId,
          });
          await databaseBuilder.commit();

          // when
          const results = await complementaryCertificationBadgeRepository.getAllWithSameTargetProfile(ccBadge2.id);

          const ccbadge1 = domainBuilder.certification.complementary.buildComplementaryCertificationBadge(ccBadge1);
          const ccbadge2 = domainBuilder.certification.complementary.buildComplementaryCertificationBadge(ccBadge2);
          expect(results).to.deepEqualInstance([ccbadge1, ccbadge2]);
        });
      },
    );

    context('when no complementary certification badge exist', function () {
      it('should throw a NotFoundError', async function () {
        // given
        const nonExistingComplementaryCertificationBadgeId = 123;

        // when
        const error = await catchErr(complementaryCertificationBadgeRepository.getAllWithSameTargetProfile)(
          nonExistingComplementaryCertificationBadgeId,
        );

        // then
        expect(error).to.be.instanceof(NotFoundError);
      });
    });
  });
});
