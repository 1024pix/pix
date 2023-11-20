import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

import { BadgeToAttach } from '../../../../../../src/certification/complementary-certification/domain/models/BadgeToAttach.js';

describe('Unit | Domain | Models | BadgeToAttach', function () {
  let clock;
  const now = new Date('2023-02-02');
  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });
  afterEach(function () {
    clock.restore();
  });

  describe('static from', function () {
    it('should build a Badge to attach', function () {
      // given
      const rawData = {
        badgeId: 123,
        createdAt: undefined,
        label: 'badge_1',
        level: 1,
        imageUrl: 'svg.pix.toto.com',
        stickerUrl: 'svg.pix.toto.com',
        certificateMessage: null,
        temporaryCertificateMessage: null,
        complementaryCertificationId: 789,
        userId: 1234,
        minimumEarnedPix: 70,
      };

      // when
      const badgeToAttach = BadgeToAttach.from(rawData);

      // then
      expect(badgeToAttach).to.deepEqualInstance(
        domainBuilder.buildBadgeToAttach({
          badgeId: 123,
          createdAt: now,
          label: 'badge_1',
          level: 1,
          imageUrl: 'svg.pix.toto.com',
          stickerUrl: 'svg.pix.toto.com',
          certificateMessage: null,
          temporaryCertificateMessage: null,
          complementaryCertificationId: 789,
          createdBy: 1234,
          minimumEarnedPix: 70,
        }),
      );
    });

    describe('when minimum earned pix is not set', function () {
      it('should build a Badge to attach with 0 minimumEarnedPix', function () {
        // given
        const rawData = {
          badgeId: 123,
          createdAt: undefined,
          label: 'badge_1',
          level: 1,
          imageUrl: 'svg.pix.toto.com',
          stickerUrl: 'svg.pix.toto.com',
          certificateMessage: null,
          temporaryCertificateMessage: null,
          complementaryCertificationId: 789,
          userId: 1234,
          minimumEarnedPix: null,
        };

        // when
        const badgeToAttach = BadgeToAttach.from(rawData);

        // then
        expect(badgeToAttach).to.deepEqualInstance(
          domainBuilder.buildBadgeToAttach({
            badgeId: 123,
            createdAt: now,
            label: 'badge_1',
            level: 1,
            imageUrl: 'svg.pix.toto.com',
            stickerUrl: 'svg.pix.toto.com',
            certificateMessage: null,
            temporaryCertificateMessage: null,
            complementaryCertificationId: 789,
            createdBy: 1234,
            minimumEarnedPix: 0,
          }),
        );
      });
    });
  });
});
