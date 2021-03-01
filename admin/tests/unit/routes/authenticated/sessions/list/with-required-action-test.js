import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/with-required-action', function(hooks) {
  setupTest(hooks);

  let store;
  hooks.beforeEach(function() {
    class StoreStub extends Service {
      query = null;
    }
    this.owner.register('service:store', StoreStub);
    store = this.owner.lookup('service:store');
  });

  module('#model', function() {
    test('it should fetch the list of sessions with required action', async function(assert) {
      // given
      const route = this.owner.lookup('route:authenticated/sessions/list/with-required-action');
      const sessionsWithRequiredAction = [{
        certificationCenterName: 'Centre SCO des Anne-Solo',
        finalizedAt: '2020-04-15T15:00:34.000Z',
      }];
      const queryStub = sinon.stub();
      queryStub.withArgs('with-required-action-session', {}).resolves(sessionsWithRequiredAction);
      store.query = queryStub;

      // when
      const result = await route.model();

      // then
      assert.equal(result, sessionsWithRequiredAction);
    });
  });
});
