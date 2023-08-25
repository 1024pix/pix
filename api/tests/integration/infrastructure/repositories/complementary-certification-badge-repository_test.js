import { databaseBuilder, expect, domainBuilder, catchErr } from '../../../test-helper.js';
import * as complementaryCertificationBadgeRepository from '../../../../lib/infrastructure/repositories/complementary-certification-badge-repository.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Integration | Repository | complementary-certification-repository', function () {
  describe('#findAllByComplementaryCertificationId', function () {
    context(
      'when at least one complementary certification badge is linked to a complementary certification',
      function () {
        it('should return a list of ComplementaryCertificationBadge', async function () {
          // given
          const badgeId = databaseBuilder.factory.buildBadge().id;
          const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
          const ccBadge1 = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId,
            complementaryCertificationId,
            label: 'complementary certification badge 1',
          });
          const ccBadge2 = databaseBuilder.factory.buildComplementaryCertificationBadge({
            badgeId,
            complementaryCertificationId,
            label: 'complementary certification badge 1',
          });

          await databaseBuilder.commit();

          // when
          const results =
            await complementaryCertificationBadgeRepository.findAllByComplementaryCertificationId(
              complementaryCertificationId,
            );

          // then
          expect(results).to.deepEqualArray([
            domainBuilder.buildComplementaryCertificationBadge({ ...ccBadge1 }),
            domainBuilder.buildComplementaryCertificationBadge({ ...ccBadge2 }),
          ]);
        });
      },
    );

    context('when no complementary certification badge is linked to a complementary certification', function () {
      it('should throw an error', async function () {
        // given
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;

        await databaseBuilder.commit();

        // when
        const error = await catchErr(complementaryCertificationBadgeRepository.findAllByComplementaryCertificationId)(
          complementaryCertificationId,
        );

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
