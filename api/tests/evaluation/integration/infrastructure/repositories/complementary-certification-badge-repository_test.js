import * as complementaryCertificationBadgeRepository from '../../../../../src/evaluation/infrastructure/repositories/complementary-certification-badge-repository.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Evaluation | Infrastructure | Repository | complementary-certification-badge-repository', function () {
  describe('#isAttachedToComplementaryCertification', function () {
    describe('when the badge is not acquired', function () {
      it('should return false', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge({ id: 1 }).id;
        await databaseBuilder.commit();

        // when
        const isAttachedToComplementaryCertification =
          await complementaryCertificationBadgeRepository.isAttachedToComplementaryCertification(badgeId);

        // then
        expect(isAttachedToComplementaryCertification).to.be.false;
      });
    });

    describe('when the badge is present in complementary-certification-badges', function () {
      it('should return true', async function () {
        // given
        const badge = databaseBuilder.factory.buildBadge();
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          badgeId: badge.id,
          complementaryCertificationId,
        }).id;
        await databaseBuilder.commit();

        // when
        const isAttachedToComplementaryCertification =
          await complementaryCertificationBadgeRepository.isAttachedToComplementaryCertification(badge.id);

        // then
        expect(isAttachedToComplementaryCertification).to.be.true;
      });
    });

    describe('when the badge is present in both complementary-certification-badges and complementary-certification-course-results', function () {
      it('should return true', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({ complementaryCertificationId: null, badgeId });
        await databaseBuilder.commit();

        // when
        const isNotAssociated =
          await complementaryCertificationBadgeRepository.isAttachedToComplementaryCertification(badgeId);

        // then
        expect(isNotAssociated).to.be.true;
      });
    });
  });
});
