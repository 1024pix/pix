import lodash from 'lodash';

import { expect } from '../../../../../test-helper.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

const { omit } = lodash;
import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/configuration/infrastructure/repositories/complementary-certification-badge-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';

describe('Integration | Infrastructure | Repository | Certification | Complementary-certification | complementary-certification-badge-repository', function () {
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
          await complementaryCertificationBadgeRepository.getAllIdsByTargetProfileId({
            targetProfileId,
          });

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
          await complementaryCertificationBadgeRepository.getAllIdsByTargetProfileId({
            targetProfileId,
          });

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
        await DomainTransaction.execute(async () => {
          await complementaryCertificationBadgeRepository.detachByIds({
            complementaryCertificationBadgeIds: [123, 456],
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
    it('should attach the complementary certification badges', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const badgeId1 = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
      const badgeId2 = databaseBuilder.factory.buildBadge({ targetProfileId }).id;
      const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
      const badgesToAttach = [
        domainBuilder.buildBadgeToAttach({
          badgeId: badgeId1,
          createdBy: userId,
          complementaryCertificationId,
          level: 1,
          label: 'PIX+ Toto',
          imageUrl: 'svg.pix.toto.com',
          stickerUrl: 'pdf.pix.toto.com',
          minimumEarnedPix: 50,
        }),

        domainBuilder.buildBadgeToAttach({
          badgeId: badgeId2,
          createdBy: userId,
          complementaryCertificationId,
          level: 2,
          label: 'PIX+ Toto 2',
          imageUrl: '2.svg.pix.toto.com',
          stickerUrl: '2.pdf.pix.toto.com',
          minimumEarnedPix: 80,
        }),
      ];

      await databaseBuilder.commit();

      // when
      await DomainTransaction.execute(async () => {
        await complementaryCertificationBadgeRepository.attach({
          complementaryCertificationBadges: badgesToAttach,
        });
      });

      // then
      const complementaryCertificationBadges = await knex('complementary-certification-badges').where({
        complementaryCertificationId,
      });

      const results = complementaryCertificationBadges.map((badge) => omit(badge, ['id', 'createdAt']));
      expect(results).to.deep.equal([
        {
          badgeId: badgeId1,
          certificateMessage: null,
          temporaryCertificateMessage: null,
          createdBy: userId,
          detachedAt: null,
          complementaryCertificationId,
          level: 1,
          label: 'PIX+ Toto',
          imageUrl: 'svg.pix.toto.com',
          stickerUrl: 'pdf.pix.toto.com',
          minimumEarnedPix: 50,
        },
        {
          badgeId: badgeId2,
          certificateMessage: null,
          temporaryCertificateMessage: null,
          createdBy: userId,
          detachedAt: null,
          complementaryCertificationId,
          level: 2,
          label: 'PIX+ Toto 2',
          imageUrl: '2.svg.pix.toto.com',
          stickerUrl: '2.pdf.pix.toto.com',
          minimumEarnedPix: 80,
        },
      ]);
    });
  });

  context('#countAttachableBadges', function () {
    it('should return the number of certifiable badges eligible to a complementary', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge({ id: 123, targetProfileId, key: 'key_xx', isCertifiable: true }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, targetProfileId, key: 'key_xxxxxx', isCertifiable: false }).id;

      await databaseBuilder.commit();

      // when
      const results = await complementaryCertificationBadgeRepository.countAttachableBadges({
        ids: [123],
      });

      // then
      expect(results).to.equal(1);
    });

    context('when there is no attached badge', function () {
      it('should return zero', async function () {
        // given
        const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        databaseBuilder.factory.buildBadge({ id: 123, targetProfileId, isCertifiable: true }).id;
        const complementaryCertificationId = databaseBuilder.factory.buildComplementaryCertification().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 456,
          badgeId: 123,
          complementaryCertificationId,
          detachedAt: '2022-01-01',
        });

        await databaseBuilder.commit();

        // when
        const results = await complementaryCertificationBadgeRepository.countAttachableBadges({
          ids: [123],
        });

        // then
        expect(results).to.equal(0);
      });
    });
  });
});
