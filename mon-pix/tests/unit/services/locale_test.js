import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Services | locale', function (hooks) {
  setupTest(hooks);

  let localeService;
  let cookiesService;
  let currentDomainService;

  hooks.beforeEach(function () {
    localeService = this.owner.lookup('service:locale');
    cookiesService = this.owner.lookup('service:cookies');
    sinon.stub(cookiesService, 'write');
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
});
