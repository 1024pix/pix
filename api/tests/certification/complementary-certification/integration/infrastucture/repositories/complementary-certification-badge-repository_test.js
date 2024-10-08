import lodash from 'lodash';

import { databaseBuilder, domainBuilder, expect, knex, sinon } from '../../../../../test-helper.js';

const { omit } = lodash;
import { DomainTransaction } from '../../../../../../lib/infrastructure/DomainTransaction.js';
import * as complementaryCertificationBadgeRepository from '../../../../../../src/certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';

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
      await DomainTransaction.execute(async () => {
        await complementaryCertificationBadgeRepository.attach({
          complementaryCertificationBadges: badgesToAttach,
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
