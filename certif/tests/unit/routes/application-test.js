import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | application', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    this.route = this.owner.lookup('route:application');

    sinon.stub(this.route.locale, 'setBestLocale').resolves();
    sinon.stub(this.route.session, 'setup').resolves();
    sinon.stub(this.route.featureToggles, 'load').resolves();
    sinon.stub(this.route.currentUser, 'load').resolves();
  });

  module('beforeModel', function () {
    test('sets best locale', async function (assert) {
      // given
      const transition = { to: { queryParams: { lang: 'fr' } } };

      // when
      await this.route.beforeModel(transition);

      // then
      sinon.assert.calledOnceWithExactly(this.route.locale.setBestLocale, { queryParams: { lang: 'fr' } });
      assert.ok(true);
    });

    test('sets up the session', async function (assert) {
      // given // when
      await this.route.beforeModel();

      // then
      assert.ok(this.route.session.setup.called);
    });

    test('loads feature toggles', async function (assert) {
      // given // when
      await this.route.beforeModel();

      // then
      assert.ok(this.route.featureToggles.load.called);
    });

    test('loads current user', async function (assert) {
      // given // when
      await this.route.beforeModel();

      // then
      assert.ok(this.route.currentUser.load.called);
    });
  });
});
