import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | User-Dashboard', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('should returns the model that contains campaignParticipationOverviews and scorecards', async function (assert) {
      // given
      const scorecards = [EmberObject.create({ id: 3 }), EmberObject.create({ id: 8 })];
      const profile = EmberObject.create({ scorecards });
      const belongsToReloadStub = sinon.stub().returns(profile);
      const belongsToStub = sinon.stub().returns({ reload: belongsToReloadStub });

      const currentUserStub = Service.create({
        user: {
          belongsTo: belongsToStub,
        },
      });

      const campaignParticipationOverviews = [EmberObject.create({ id: 10 })];
      const storeStub = { query: sinon.stub().returns(campaignParticipationOverviews) };

      const route = this.owner.lookup('route:authenticated.user-dashboard');
      route.set('currentUser', currentUserStub);
      route.set('store', storeStub);

      // when
      const model = await route.model();

      // then
      assert.deepEqual(model.campaignParticipationOverviews, campaignParticipationOverviews);
      assert.deepEqual(model.scorecards, scorecards);
    });
  });
});
