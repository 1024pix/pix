import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import ENV from '../../../config/environment';

module('Unit | Route | login', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:session-supervising');
    assert.ok(route);
  });

  module('#afterModel', function (hooks) {
    let sessionSupervisingPollingRate;

    hooks.beforeEach(function () {
      sessionSupervisingPollingRate = ENV.APP.sessionSupervisingPollingRate;
    });

    hooks.afterEach(function () {
      ENV.APP.sessionSupervisingPollingRate = sessionSupervisingPollingRate;
    });

    test('it should stop polling when an error occurs in session supervising fetch', function (assert) {
      const done = assert.async();
      assert.expect(2);

      ENV.APP.sessionSupervisingPollingRate = 100;

      const route = this.owner.lookup('route:session-supervising');
      const session = { id: 123 };
      route.store = { queryRecord: sinon.stub() };

      route.store.queryRecord.onCall(0).returns(Promise.resolve());
      route.store.queryRecord.onCall(1).throws(new Error());

      route.afterModel(session);

      setTimeout(function () {
        assert.strictEqual(route.poller, null);
        assert.strictEqual(route.store.queryRecord.callCount, 2);

        done();
      }, 250);
    });
  });
});
