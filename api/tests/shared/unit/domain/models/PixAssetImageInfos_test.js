import { PixAssetImageInfos } from '../../../../../src/shared/domain/models/PixAssetImageInfos.js';

describe('Unit | Devcomp | Domain | Models | Element | Image', function () {
  describe('#constructor', function () {
    it('should get image infos and keep attributes', function () {
      // when
      const imageInfos = new PixAssetImageInfos({
        width: 300,
        height: 200,
        contentType: 'image/svg+xml',
      });

      // then
      expect(imageInfos.width).to.equal(300);
      expect(imageInfos.height).to.equal(200);
      expect(imageInfos.type).to.equal('vector');
    });
  });

  describe('An image without width/height', function () {
    it('should keep type attributes', function () {
      // when
      const imageInfos = new PixAssetImageInfos({ contentType: 'image/svg+xml' });

      // then
      expect(imageInfos.width).to.be.undefined;
      expect(imageInfos.height).to.be.undefined;
      expect(imageInfos.type).to.equal('vector');
    });
  });

  describe('An image without contentType', function () {
    it('should set width and height', function () {
      // when
      const imageInfos = new PixAssetImageInfos({ width: 300, height: 200 });

      // then
      expect(imageInfos.width).to.equal(300);
      expect(imageInfos.height).to.equal(200);
      expect(imageInfos.type).to.be.undefined;
    });
  });

  describe('An image with unknown contentType', function () {
    it('should not set type', function () {
      // when
      const imageInfos = new PixAssetImageInfos({ width: 300, height: 200, contentType: 'text/html' });

      // then
      expect(imageInfos.width).to.equal(300);
      expect(imageInfos.height).to.equal(200);
      expect(imageInfos.type).to.be.undefined;
    });
  });

  describe('An image without nothing', function () {
    it('should set no attributes', function () {
      // when
      const imageInfos = new PixAssetImageInfos({});

      // then
      expect(imageInfos.width).to.be.undefined;
      expect(imageInfos.height).to.be.undefined;
      expect(imageInfos.type).to.be.undefined;
    });
  });
});
