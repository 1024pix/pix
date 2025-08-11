import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | currentDomain', function (hooks) {
  setupTest(hooks);

  module('#getExtension', function () {
    module('when location is FR TLD', function () {
      test(`returns fr`, function (assert) {
        // given
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('https://pix.fr/foo?bar=baz');

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
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('https://pix.org/foo?bar=baz');

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
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('https://pix.fr/foo?bar=baz');

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
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('https://pix.org/foo?bar=baz');

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
      test('returns locahost as domain', function (assert) {
        // given
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('http://localhost:4200/foo?bar=baz');

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
        const locationService = this.owner.lookup('service:location');
        sinon.stub(locationService, 'href').value('https://orga.pix.fr/foo?bar=baz');

        // when
        const service = this.owner.lookup('service:currentDomain');
        const domain = service.domain;

        // then
        assert.strictEqual(domain, 'pix.fr');
      });
    });
  });
});
