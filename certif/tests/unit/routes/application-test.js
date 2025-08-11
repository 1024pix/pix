import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    const domainService = this.owner.lookup('service:currentDomain');
    sinon.stub(domainService, 'getExtension').returns('fr');

    class CurrentUserStub extends Service {
      load = sinon.stub();
    }
    this.owner.register('service:currentUser', CurrentUserStub);
  });

  module('beforeModel', function () {
    test('loads feature toggles', async function (assert) {
      // given
      const transition = { to: { queryParams: {} } };
      const route = this.owner.lookup('route:application');

      sinon.stub(route.featureToggles, 'load');
      route.featureToggles.load.resolves();

      sinon.stub(route.session, 'loadCurrentUserAndSetLocale');

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(route.featureToggles.load.called);
    });

    test('calls loadCurrentUserAndSetLocale', async function (assert) {
      // given
      const transition = { to: { queryParams: { lang: 'fr' } } };
      const route = this.owner.lookup('route:application');

      sinon.stub(route.featureToggles, 'load');
      route.featureToggles.load.resolves();

      sinon.stub(route.session, 'loadCurrentUserAndSetLocale');
      route.session.loadCurrentUserAndSetLocale.resolves();

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledOnceWithExactly(route.session.loadCurrentUserAndSetLocale, transition);
      assert.ok(true);
    });
  });
});
