import { expect, databaseBuilder, knex, domainBuilder } from '../../../../../test-helper.js';
import lodash from 'lodash';
const { omit } = lodash;
import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';

describe('Integration | Infrastructure | Repository | complementary-certification-badge-repository', function () {
  context('#getAllIdsByTargetProfileId', function () {
    context('when complementary certification badges are linked to a target profile', function () {
      it('should return complementary certification badge ids', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 123,
          badgeId,
          complementaryCertificationId,
          detachedAt: '2022-01-01',
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 456,
          badgeId,
          complementaryCertificationId,
          detachedAt: null,
        });

        await databaseBuilder.commit();

        // when
        const complementaryCertificationBadgeIds =
          await complementaryCertificationBadgeRepository.getAllIdsByTargetProfileId({ targetProfileId });

        // then
        expect(complementaryCertificationBadgeIds).to.deep.equal([456]);
      });
    });

    context('when no complementary certification badge is linked to a target profile', function () {
      it('should return empty array', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;

        await databaseBuilder.commit();

        // when
        const complementaryCertificationBadgeIds =
          await complementaryCertificationBadgeRepository.getAllIdsByTargetProfileId({ targetProfileId });

        // then
        expect(complementaryCertificationBadgeIds).to.deep.equal([]);
      });
    });
  });

  context('#detachByIds', function () {
    context('when complementary certification badges are linked to a target profile', function () {
      it('should detach the complementary certification badges', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 123,
          badgeId,
          complementaryCertificationId,
          detachedAt: null,
        }).id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 456,
          badgeId,
          complementaryCertificationId,
          detachedAt: null,
        }).id;

        await databaseBuilder.commit();

        // when
        await DomainTransaction.execute(async (domainTransaction) => {
          await complementaryCertificationBadgeRepository.detachByIds({
            complementaryCertificationBadgeIds: [123, 456],
            domainTransaction,
          });
        });

        // then
        const complementaryCertificationBadges = await knex('complementary-certification-badges').whereIn(
          'id',
          [123, 456],
        );

        complementaryCertificationBadges.forEach((ccBadge) => {
          expect(ccBadge.detachedAt).to.not.be.null;
        });
      });
    });
  });

  context('#attach', function () {
    afterEach(async function () {
      return knex('complementary-certification-badges').delete();
    });

    it('should attach the complementary certification badges', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const badgeToAttach = domainBuilder.buildBadgeToAttach({
        badgeId,
        createdBy: userId,
        complementaryCertificationId,
        level: 1,
        label: 'PIX+ Toto',
        imageUrl: 'svg.pix.toto.com',
        stickerUrl: 'svg.pix.toto.com',
      });

      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async (domainTransaction) => {
        await complementaryCertificationBadgeRepository.attach({
          complementaryCertificationId,
          complementaryCertificationBadge: badgeToAttach,
          domainTransaction,
        });
      });

      // then
      const complementaryCertificationBadge = await knex('complementary-certification-badges')
        .where({
          label: 'PIX+ Toto',
        })
        .first();

      expect(omit(complementaryCertificationBadge, ['id', 'createdAt'])).to.deep.equal({
        badgeId,
        certificateMessage: null,
        temporaryCertificateMessage: null,
        createdBy: userId,
        detachedAt: null,
        complementaryCertificationId,
        level: 1,
        label: 'PIX+ Toto',
        imageUrl: 'svg.pix.toto.com',
        stickerUrl: 'svg.pix.toto.com',
      });
    });
  });
});
