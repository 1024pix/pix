import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list', function (hooks) {
  setupTest(hooks);

  let store;
  hooks.beforeEach(function () {
    class StoreStub extends Service {
      query = null;
    }
    this.owner.register('service:store', StoreStub);
    store = this.owner.lookup('service:store');
  });

  module('#model', function () {
    test('it should fetch the sessions lists', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/sessions/list');

      const v2SessionWithRequiredAction = [Symbol('v2SessionWithRequiredAction')];
      const v2SessionToBePublished = [Symbol('v2SessionToBePublished')];

      const queryStub = sinon.stub();
      queryStub
        .withArgs('with-required-action-session', { filter: { version: 2 } })
        .resolves(v2SessionWithRequiredAction);
      queryStub.withArgs('to-be-published-session', { filter: { version: 2 } }).resolves(v2SessionToBePublished);

      const v3SessionsWithRequiredAction = [Symbol('v3SessionWithRequiredAction')];
      const v3SessionToBePublished = [Symbol('v3SessionToBePublished')];

      queryStub
        .withArgs('with-required-action-session', { filter: { version: 3 } })
        .resolves(v3SessionsWithRequiredAction);
      queryStub.withArgs('to-be-published-session', { filter: { version: 3 } }).resolves(v3SessionToBePublished);

      store.query = queryStub;

      // when
      const { refreshModel, ...result } = await route.model();

      // then
      assert.deepEqual(result, {
        v2SessionsToBePublished: v2SessionToBePublished,
        v2SessionsWithRequiredAction: v2SessionWithRequiredAction,
        v3SessionsToBePublished: v3SessionToBePublished,
        v3SessionsWithRequiredAction: v3SessionsWithRequiredAction,
      });

      assert.strictEqual(typeof refreshModel, 'function');
    });
  });
});
