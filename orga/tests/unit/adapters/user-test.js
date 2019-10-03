import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | user', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:user');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForUpdateRecord', function() {

    test('it should build update url from user id', async function(assert) {
      // when
      const snapshot = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.equal(url.endsWith('/users/123'), true);
    });

    test('it should redirect to pix-orga-terms-of-service-acceptance', async function(assert) {
      // when
      const snapshot = { adapterOptions: { acceptPixOrgaTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.equal(url.endsWith('/users/123/pix-orga-terms-of-service-acceptance'), true);
    });
  });
});
