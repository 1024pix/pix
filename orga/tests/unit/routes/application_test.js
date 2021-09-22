import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should load feature toggles', async function (assert) {
      // given
      const transition = { to: { queryParams: {} } };
      const route = this.owner.lookup('route:application');

      sinon.stub(route.featureToggles, 'load');
      route.featureToggles.load.resolves();

      sinon.stub(route.session, 'handlePrescriberLanguageAndLocale');
      route.session.handlePrescriberLanguageAndLocale.resolves();

      // when
      await route.beforeModel(transition);

      // then
      assert.ok(route.featureToggles.load.called);
    });

    module('When lang parameter exist', function () {
      test('should use lang parameter with session service method', async function (assert) {
        // given
        const transition = { to: { queryParams: { lang: 'fr' } } };
        const route = this.owner.lookup('route:application');

        sinon.stub(route.featureToggles, 'load');
        route.featureToggles.load.resolves();

        sinon.stub(route.session, 'handlePrescriberLanguageAndLocale');
        route.session.handlePrescriberLanguageAndLocale.resolves();

        // when
        await route.beforeModel(transition);

        // then
        assert.ok(route.session.handlePrescriberLanguageAndLocale.calledWith('fr'));
      });
    });
  });
});
