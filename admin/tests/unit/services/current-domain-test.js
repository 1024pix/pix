import { setupTest } from 'ember-qunit';
import Location from 'pix-admin/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | currentDomain', function (hooks) {
  setupTest(hooks);
  module('#getExtension', function () {
    module('when location is FR TLD', function () {
      test(`returns fr`, function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('https://pix.fr/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const extension = service.getExtension();

        // then
        assert.strictEqual(extension, 'fr');
      });
    });

    module('when location is ORG TLD', function () {
      test(`returns org`, function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('https://pix.org/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const extension = service.getExtension();

        // then
        assert.strictEqual(extension, 'org');
      });
    });
  });

  module('#isFranceDomain', function () {
    module('when location is FR TLD', function () {
      test('returns true', function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('https://pix.fr/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const isFranceDomain = service.isFranceDomain;

        // then
        assert.true(isFranceDomain);
      });
    });

    module('when location is ORG TLD', function () {
      test('returns false', function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('https://pix.org/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const isFranceDomain = service.isFranceDomain;

        // then
        assert.false(isFranceDomain);
      });
    });
  });

  module('#domain', function () {
    module('when location is localhost', function () {
      test('returns localhost as domain', function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('http://localhost:4200/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const domain = service.domain;

        // then
        assert.strictEqual(domain, 'localhost');
      });
    });

    module('when location is not localhost', function () {
      test('returns the last 2-parts segment', function (assert) {
        // given

        sinon.stub(Location, 'getHref').returns('https://pix.fr/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const domain = service.domain;

        // then
        assert.strictEqual(domain, 'pix.fr');
      });
    });
  });
});
