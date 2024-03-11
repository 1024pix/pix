import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | User-Tests', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('should returns the model that contains campaignParticipationOverviews', async function (assert) {
      // given
      const currentUserStub = Service.create({ user: { id: 1 } });
      const store = this.owner.lookup('service:store');
      sinon.stub(store, 'query');

      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];
      store.query
        .withArgs('campaign-participation-overview', {
          userId: 1,
          'page[number]': 1,
          'page[size]': 100,
          'filter[states]': ['ONGOING', 'TO_SHARE', 'ENDED', 'DISABLED'],
        })
        .returns(campaignParticipationOverviews);

      const route = this.owner.lookup('route:authenticated/user-tests');
      route.set('currentUser', currentUserStub);
      route.set('store', store);

      // when
      const model = await route.model();

      // then
      assert.deepEqual(model, campaignParticipationOverviews);
    });
  });

  module('redirect', function () {
    test('should redirect to default page if there is no campaign participation', function (assert) {
      const route = this.owner.lookup('route:authenticated/user-tests');
      sinon.stub(route.router, 'replaceWith');

      route.redirect([], {});
      sinon.assert.calledWithExactly(route.router.replaceWith, '');
      assert.ok(true);
    });

    test('should continue on user-tests if there is some campaign participations', function (assert) {
      const route = this.owner.lookup('route:authenticated/user-tests');
      sinon.stub(route.router, 'replaceWith');
      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];

      route.redirect(campaignParticipationOverviews, {});
      sinon.assert.notCalled(route.router.replaceWith);
      assert.ok(true);
    });
  });
});
