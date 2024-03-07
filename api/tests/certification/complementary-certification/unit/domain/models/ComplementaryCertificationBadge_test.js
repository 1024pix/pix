import { ComplementaryCertificationBadge } from '../../../../../../src/certification/complementary-certification/domain/models/ComplementaryCertificationBadge.js';
import { expect } from '../../../../../test-helper.js';

describe('Unit | Certification | complementary-certification | Domain | Models | ComplementaryCertificationBadge', function () {
  it('should return a complementary certification', function () {
    // given
    const rawData = {
      id: 1,
      label: 'badge Toto',
      level: 1,
      imageUrl: 'http://badge-image-url.fr',
      minimumEarnedPix: 0,
      createdAt: '2021-01-01',
      complementaryCertificationId: 123,
      badgeId: 456,
      certificateMessage: 'bravo',
      temporaryCertificateMessage: 'super',
      stickerUrl: 'sticker.fr',
      detachedAt: null,
      createdBy: 12345,
    };

    const complementaryCertification = new ComplementaryCertificationBadge(rawData);

    // when / then
    expect(complementaryCertification).to.deep.equal(rawData);
    expect(complementaryCertification).to.be.instanceOf(ComplementaryCertificationBadge);
  });
});
