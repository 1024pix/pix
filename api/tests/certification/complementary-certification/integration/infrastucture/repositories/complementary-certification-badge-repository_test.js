import lodash from 'lodash';

import { catchErr, databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

const { omit } = lodash;
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';

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
    let clock;
    const createdAt = new Date('2023-09-19T01:02:03Z');

    beforeEach(function () {
      clock = sinon.useFakeTimers({ now: createdAt, toFake: ['Date'] });
    });

    afterEach(async function () {
      clock.restore();
    });

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
      await DomainTransaction.execute(async (domainTransaction) => {
        await complementaryCertificationBadgeRepository.attach({
          complementaryCertificationBadges: badgesToAttach,
          domainTransaction,
        });
      });

      // then
      const complementaryCertificationBadges = await knex('complementary-certification-badges').where({
        complementaryCertificationId,
      });

      const results = complementaryCertificationBadges.map((badge) => omit(badge, ['id']));
      expect(results).to.deep.equal([
        {
          badgeId: badgeId1,
          certificateMessage: null,
          temporaryCertificateMessage: null,
          createdBy: userId,
          createdAt,
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
          createdAt,
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

  context('#findAttachableBadgesByIds', function () {
    it('should return certifiable badges and eligible to a complementary', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildBadge({ id: 123, targetProfileId, key: 'key_xx', isCertifiable: true }).id;
      databaseBuilder.factory.buildBadge({ id: 12345, targetProfileId, key: 'key_xxxxxx', isCertifiable: false }).id;

      await databaseBuilder.commit();

      // when
      const results = await complementaryCertificationBadgeRepository.findAttachableBadgesByIds({
        ids: [123],
      });

      // then
      expect(results).to.deep.equal([
        {
          altMessage: 'alt message',
          complementaryCertificationBadge: null,
          id: 123,
          imageUrl: '/img_funny.svg',
          isAlwaysVisible: false,
          isCertifiable: true,
          key: 'key_xx',
          message: 'message',
          targetProfileId,
          title: 'title',
        },
      ]);
    });

    it('should not return inexistent badges', async function () {
      // given
      const nonExistingBadgeId = 123456789;
      const nonExistingBadge = await knex('complementary-certification-badges').whereIn('id', [nonExistingBadgeId]);
      expect(nonExistingBadge).to.be.empty;

      // when
      const results = await complementaryCertificationBadgeRepository.findAttachableBadgesByIds({
        ids: [nonExistingBadgeId],
      });

      // then
      expect(results).to.be.empty;
    });

    it('should not return badges tied to a complementary', async function () {
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
      const results = await complementaryCertificationBadgeRepository.findAttachableBadgesByIds({
        ids: [123],
      });

      // then
      expect(results).to.be.empty;
    });
  });

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

  describe('#isRelatedToCertification', function () {
    describe('when the badge is not acquired', function () {
      it('should return false', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge({ id: 1 }).id;
        await databaseBuilder.commit();

        // when
        const isRelatedToCertification =
          await complementaryCertificationBadgeRepository.isRelatedToCertification(badgeId);

        // then
        expect(isRelatedToCertification).to.be.false;
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
        const isRelatedToCertification = await complementaryCertificationBadgeRepository.isRelatedToCertification(
          badge.id,
        );

        // then
        expect(isRelatedToCertification).to.be.true;
      });
    });

    describe('when the badge is present in both complementary-certification-badges and complementary-certification-course-results', function () {
      it('should return true', async function () {
        // given
        const badgeId = databaseBuilder.factory.buildBadge().id;
        databaseBuilder.factory.buildComplementaryCertificationBadge({ complementaryCertificationId: null, badgeId });
        await databaseBuilder.commit();

        // when
        const isNotAssociated = await complementaryCertificationBadgeRepository.isRelatedToCertification(badgeId);

        // then
        expect(isNotAssociated).to.be.true;
      });
    });
  });
});
