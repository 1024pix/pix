import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Service | session', function (hooks) {
  setupTest(hooks);

  let user;
  let routerService;
  let service;

  hooks.beforeEach(function () {
    user = { lang: 'fr' };

    routerService = this.owner.lookup('service:router');
    routerService.transitionTo = sinon.stub();

    service = this.owner.lookup('service:session');
    service.currentUser = { load: sinon.stub(), certificationPointOfContact: user };
    service.locale = { setBestLocale: sinon.stub(), isSupportedLocale: sinon.stub().returns(true) };
  });

  module('#handleAuthentication', function () {
    test('loads current user and sets locale', async function (assert) {
      // when
      await service.handleAuthentication();

      // then
      sinon.assert.calledOnce(service.currentUser.load);
      sinon.assert.calledWith(service.locale.setBestLocale, { user, queryParams: undefined });
      assert.ok(true);
    });
  });

  module('#handleInvalidation', function () {
    test('overrides handleInvalidation method', function (assert) {
      // then
      assert.true(service.handleInvalidation instanceof Function);
    });

    test('calls clear method from session store', function (assert) {
      // given
      sinon.stub(service.store, 'clear');

      // when
      service.handleInvalidation();

      // then
      assert.true(service.store.clear.calledOnce);
    });
  });

  module('#loadCurrentUserAndSetLocale', function () {
    module('when locale is supported', function () {
      test('loads the current user, sets locale sets data.localeNotSupported to false', async function (assert) {
        // given
        const queryParams = { lang: 'fr' };

        // when
        await service.loadCurrentUserAndSetLocale({ to: { queryParams } });

        // then
        sinon.assert.calledOnce(service.currentUser.load);
        sinon.assert.calledWith(service.locale.setBestLocale, { user, queryParams });
        assert.false(service.data.localeNotSupported);
      });
    });

    module('when locale is not supported', function () {
      test('loads the current user, sets locale sets data.localeNotSupported to true', async function (assert) {
        // given
        const queryParams = { lang: 'es' };

        service.locale.isSupportedLocale = sinon.stub().returns(false);

        // when
        await service.loadCurrentUserAndSetLocale({ to: { queryParams } });

        // then
        sinon.assert.calledOnce(service.currentUser.load);
        sinon.assert.calledWith(service.locale.setBestLocale, { user, queryParams });
        assert.true(service.data.localeNotSupported);
      });
    });
  });

  module('#updateDataAttribute', function () {
    test('updates session data attribute value', function (assert) {
      // when
      service.updateDataAttribute('message', 'This is a message!');
      service.updateDataAttribute('isItUsed', true);
      service.updateDataAttribute('notDisplayed', false);

      // then
      assert.strictEqual(service.data.message, 'This is a message!');
      assert.true(service.data.isItUsed);
      assert.false(service.data.notDisplayed);
    });
  });
});
