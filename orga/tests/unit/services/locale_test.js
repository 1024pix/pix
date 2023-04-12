import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Service | locale', function (hooks) {
  setupTest(hooks);

  let localeService;
  let cookiesService;
  let currentDomainService;

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');

    cookiesService = this.owner.lookup('service:cookies');
    sinon.stub(cookiesService, 'write');
    sinon.stub(cookiesService, 'exists');

    currentDomainService = this.owner.lookup('service:currentDomain');
    sinon.stub(currentDomainService, 'getExtension');
  });

  module('#setLocaleCookie', function () {
    test('saves the locale in cookie locale', function (assert) {
      // given
      currentDomainService.getExtension.returns('fr');

      // when
      localeService.setLocaleCookie('fr-CA');

      // then
      sinon.assert.calledWith(cookiesService.write, 'locale', 'fr-CA', {
        domain: 'pix.fr',
        maxAge: 31536000,
        path: '/',
        sameSite: 'Strict',
      });
      assert.ok(true);
    });
  });

  module('#hasLocaleCookie', function () {
    module('when there is no cookie locale', function () {
      test('returns "false"', function (assert) {
        // given
        cookiesService.exists.returns(false);

        // when
        const hasNoCookieLocale = localeService.hasLocaleCookie();

        // then
        sinon.assert.calledWith(cookiesService.exists, 'locale');
        assert.notOk(hasNoCookieLocale);
      });
    });

    module('when there is a cookie locale', function () {
      test('returns "true"', function (assert) {
        // given
        cookiesService.exists.returns(true);

        // when
        const hasCookieLocale = localeService.hasLocaleCookie();

        // then
        sinon.assert.calledWith(cookiesService.exists, 'locale');
        assert.ok(hasCookieLocale);
      });
    });
  });
});
