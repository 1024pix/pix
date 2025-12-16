import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  test('hides the splash when the route is activated', function (assert) {
    // Given
    const SplashServiceStub = Service.create({
      hideCount: 0,
      hide() {
        this.hideCount++;
      },
    });

    const route = this.owner.lookup('route:application');
    route.set('splash', SplashServiceStub);

    // When
    route.activate();

    // Then
    assert.strictEqual(SplashServiceStub.hideCount, 1);
  });

  module('#beforeModel', function (hooks) {
    let configServiceStub,
      localeServiceStub,
      currentUserServiceStub,
      featureTogglesServiceStub,
      sessionServiceStub,
      oidcIdentityProvidersStub;

    hooks.beforeEach(function () {
      const catchStub = sinon.stub();

      configServiceStub = Service.create({
        load: sinon.stub().resolves(catchStub),
      });

      featureTogglesServiceStub = Service.create({
        load: sinon.stub().resolves(catchStub),
      });

      sessionServiceStub = Service.create({
        setup: sinon.stub().resolves(),
      });

      localeServiceStub = Service.create({
        setBestLocale: sinon.stub().resolves(),
      });

      currentUserServiceStub = Service.create({
        load: sinon.stub().resolves(),
      });

      oidcIdentityProvidersStub = Service.create({
        load: sinon.stub().resolves(),
      });

      this.intl = this.owner.lookup('service:intl');
    });

    test('fetches the config', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('config', configServiceStub);
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('currentUser', currentUserServiceStub);
      route.set('locale', localeServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(configServiceStub.load);
      assert.ok(true);
    });

    test('sets best locale', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('config', configServiceStub);
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('currentUser', currentUserServiceStub);
      route.set('locale', localeServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);
      const transition = { to: { queryParams: { lang: 'fr' } } };

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(localeServiceStub.setBestLocale, { queryParams: { lang: 'fr' } });
      assert.ok(true);
    });

    test('sets up the session', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('config', configServiceStub);
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('currentUser', currentUserServiceStub);
      route.set('locale', localeServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(sessionServiceStub.setup);
      assert.ok(true);
    });

    test('gets feature toggles', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('config', configServiceStub);
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('currentUser', currentUserServiceStub);
      route.set('locale', localeServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(featureTogglesServiceStub.load);
      assert.ok(true);
    });

    test('gets current user', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('config', configServiceStub);
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('currentUser', currentUserServiceStub);
      route.set('locale', localeServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(currentUserServiceStub.load);
      assert.ok(true);
    });
  });

  module('error', function () {
    module('when the error is a 401', function () {
      test('should return false to prevent ember error handling', async function (assert) {
        // given
        const route = this.owner.lookup('route:application');

        const currentError = { errors: [{ status: '401' }] };

        // when
        const err = await route.error(currentError);

        // then
        assert.false(err);
      });
    });

    module('when the error is a 403 with HTML content-type', function () {
      test('should return false to prevent ember error handling', async function (assert) {
        // given
        const route = this.owner.lookup('route:application');

        const currentError = { error: '...Payload (text/html;...', errors: [{ status: '403' }] };

        // when
        const err = await route.error(currentError);

        // then
        assert.false(err);
      });
    });

    module('when the error is not a 401 or a a 403 with HTML content-type', function () {
      test('should return true to keep ember error handling', async function (assert) {
        // given
        const route = this.owner.lookup('route:application');

        const currentError = { errors: [{ status: '404' }] };

        // when
        const err = await route.error(currentError);

        // then
        assert.true(err);
      });
    });
  });
});
