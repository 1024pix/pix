import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    class currentDomainStub extends Service {
      get isFranceDomain() {
        return true;
      }
    }
    this.owner.register('service:currentDomain', currentDomainStub);

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

      sinon.stub(route.session, 'handleLocale');

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(route.featureToggles.load.called);
    });

    test('calls handleLocale', async function (assert) {
      // given
      const transition = { to: { queryParams: { lang: 'fr' } } };
      const route = this.owner.lookup('route:application');

      sinon.stub(route.featureToggles, 'load');
      route.featureToggles.load.resolves();

      sinon.stub(route.session, 'handleLocale');
      route.session.handleLocale.resolves();

      // when
      await route.beforeModel(transition);

      // then
      sinon.assert.calledWith(route.session.handleLocale, {
        isFranceDomain: true,
        localeFromQueryParam: 'fr',
        userLocale: undefined,
      });
      assert.ok(true);
    });
  });
});
