import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | certification-candidate', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:certification-candidate');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForCreateRecord', function() {

    test('should build create url from certification-candidate id', async function(assert) {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.equal(url.endsWith('/certification-candidates'), true);
    });

    test('should build create url when registerToSession is true', async function(assert) {
      // when
      const options = { adapterOptions: { registerToSession: true, sessionId: 456 } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.equal(url.endsWith('/sessions/456/certification-candidates'), true);
    });

  });

});
