import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | prescriber', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:prescriber');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQueryRecord', function() {

    test('should add /prescription inside prescriber query record', function(assert) {
      // when
      const url = adapter.urlForQueryRecord(2);

      // then
      assert.ok(url.endsWith('/prescription/prescribers/2'));
    });
  });

});
