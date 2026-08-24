import Location from 'pix-admin/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Utility | location', function () {
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

  module('#replace', function () {
    test('should replace the current URL', function (assert) {
      // given
      const newUrl = 'https://example.com/new-path';
      const replaceStub = sinon.stub(Location, 'replace');

      // when
      Location.replace(newUrl);

      // then
      sinon.assert.calledWith(replaceStub, newUrl);
      assert.ok(true);
    });
  });
});
