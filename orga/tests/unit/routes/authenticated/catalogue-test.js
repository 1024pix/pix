import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/catalogue', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test("it should redirect to index page if user can't access campaign page", async function (assert) {
      // given
      const featureToggleService = this.owner.lookup('service:feature-toggles');
      sinon.stub(featureToggleService, 'featureToggles').value({ displayCatalogue: true });

      const currentUserService = this.owner.lookup('service:current-user');
      sinon.stub(currentUserService, 'canAccessCampaignsPage').value(false);
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');
      const route = this.owner.lookup('route:authenticated/catalogue');

      // when
      await route.beforeModel();

      //then
      assert.ok(routerService.replaceWith.calledOnceWithExactly('authenticated.index'));
    });
    test('it should redirect to index page if feature displayCatalogue is not active', async function (assert) {
      // given
      const currentUserService = this.owner.lookup('service:current-user');
      sinon.stub(currentUserService, 'canAccessCampaignsPage').value(true);

      const featureToggleService = this.owner.lookup('service:feature-toggles');
      sinon.stub(featureToggleService, 'featureToggles').value({ displayCatalogue: false });
      const routerService = this.owner.lookup('service:router');
      sinon.stub(routerService, 'replaceWith');
      const route = this.owner.lookup('route:authenticated/catalogue');

      // when
      await route.beforeModel();

      //then
      assert.ok(routerService.replaceWith.calledOnceWithExactly('authenticated.index'));
    });
  });
});
