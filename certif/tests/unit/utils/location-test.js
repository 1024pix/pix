import Location from 'pix-certif/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | location (certif)', function () {
  module('#getHref', function () {
    test('should return the full URL', function (assert) {
      // given
      const expectedUrl = 'https://example.com/path?query=param#hash';
      sinon.stub(Location, 'getHref').returns(expectedUrl);

      // when
      const url = Location.getHref();

      // then
      assert.strictEqual(url, expectedUrl);
    });
  });
});
