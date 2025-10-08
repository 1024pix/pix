import { resizeByHeight, resizeByWidth, resizeImage } from 'mon-pix/utils/resize-image';
import { module, test } from 'qunit';

module.only('Unit | Utility | Resize Image', function () {
  module('#resizeImage', function () {
    test('should return null if there is no information', function (assert) {
      // given
      const imageInformation = null;

      // when
      const dimensions = resizeImage(imageInformation, { MAX_HEIGHT: 100 });

      // then
      assert.deepEqual(dimensions, null);
    });

    test('should return null if image height is equal to 0', function (assert) {
      // given
      const imageInformation = { height: 0 };

      // when
      const dimensions = resizeImage(imageInformation, { MAX_HEIGHT: 100 });

      // then
      assert.deepEqual(dimensions, null);
    });

    test('should return null if image width is equal to 0', function (assert) {
      // given
      const imageInformation = { width: 0 };

      // when
      const dimensions = resizeImage(imageInformation, { MAX_HEIGHT: 100 });

      // then
      assert.deepEqual(dimensions, null);
    });

    test(')
  });
  module('#resizeByHeight', function () {
    test('should return the accurate result for a resize by height', function (assert) {
      // given
      const imageInformation = { width: 100, height: 50 };
      const MAX_HEIGHT = 100;
      // when
      const dimensions = resizeByHeight(imageInformation, MAX_HEIGHT);

      // then
      assert.deepEqual(dimensions, { width: 200, height: 100 });
    });
  });
  module('#resizeByWidth', function () {
    test('should return the accurate result for a resize by width', function (assert) {
      // given
      const imageInformation = { width: 50, height: 100 };
      const MAX_WIDTH = 100;
      // when
      const dimensions = resizeByWidth(imageInformation, MAX_WIDTH);

      // then
      assert.deepEqual(dimensions, { width: 100, height: 200 });
    });
  });
});
