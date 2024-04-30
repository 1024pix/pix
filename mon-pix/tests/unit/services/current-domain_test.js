import { setupTest } from 'ember-qunit';
import PixWindow from 'mon-pix/utils/pix-window';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | currentDomain', function (hooks) {
  setupTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  module('#isFranceDomain', function () {
    module('when TLD is the France domain (.fr)', function () {
      test('returns true', function (assert) {
        // given
        _stubWindowLocationHostname('pix.fr');
        const service = this.owner.lookup('service:currentDomain');

        // when
        const isFranceDomain = service.isFranceDomain;

        // then
        assert.true(isFranceDomain);
      });
    });

    module('when TLD is the international domain (.org)', function () {
      test('returns false', function (assert) {
        // given
        _stubWindowLocationHostname('pix.org');
        const service = this.owner.lookup('service:currentDomain');

        // when
        const isFranceDomain = service.isFranceDomain;

        // then
        assert.false(isFranceDomain);
      });
    });
  });
});

function _stubWindowLocationHostname(hostname) {
  sinon.stub(PixWindow, 'getLocationHostname').returns(hostname);
}
