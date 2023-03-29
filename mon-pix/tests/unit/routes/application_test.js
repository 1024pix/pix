import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
    let featureTogglesServiceStub, sessionServiceStub, oidcIdentityProvidersStub;

    hooks.beforeEach(function () {
      const catchStub = sinon.stub();

      featureTogglesServiceStub = Service.create({
        load: sinon.stub().resolves(catchStub),
      });
      sessionServiceStub = Service.create({
        handleUserLanguageAndLocale: sinon.stub().resolves(),
      });
      oidcIdentityProvidersStub = Service.create({
        load: sinon.stub().resolves(),
      });

      this.intl = this.owner.lookup('service:intl');
    });

    test('should set "fr" locale as default', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      assert.strictEqual(this.intl.primaryLocale, 'fr');
    });

    test('should set the head description', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      assert.strictEqual(route.headData.description, this.intl.t('application.description'));
    });

    test('should get feature toogles', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);

      // when
      await route.beforeModel();

      // then
      sinon.assert.calledOnce(featureTogglesServiceStub.load);
      assert.ok(true);
    });

    test('should get language and local of user', async function (assert) {
      // given
      const route = this.owner.lookup('route:application');
      route.set('featureToggles', featureTogglesServiceStub);
      route.set('session', sessionServiceStub);
      route.set('oidcIdentityProviders', oidcIdentityProvidersStub);
      const transition = { from: 'inscription' };
      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(sessionServiceStub.handleUserLanguageAndLocale, transition);
      assert.ok(true);
    });
  });
});
