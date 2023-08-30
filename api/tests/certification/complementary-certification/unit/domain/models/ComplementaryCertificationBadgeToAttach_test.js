import { domainBuilder, expect, sinon } from '../../../../../test-helper.js';

import { ComplementaryCertificationBadgeToAttach } from '../../../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationBadgeToAttach.js';

describe('Unit | Domain | Models | Certification Badge', function () {
  let clock;
  const now = new Date('2023-02-02');
  beforeEach(function () {
    clock = sinon.useFakeTimers(now);
  });
  afterEach(function () {
    clock.restore();
  });

  describe('static from', function () {
    it('should build a Complementary Certification Badge to attach', function () {
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
      };

      // when
      const complementaryCertificationBadgeToAttach = ComplementaryCertificationBadgeToAttach.from(rawData);

      // then
      expect(complementaryCertificationBadgeToAttach).to.deepEqualInstance(
        domainBuilder.buildComplementaryCertificationBadgeToAttach({
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
        }),
      );
    });
  });
});
