import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | user', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:user');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForUpdateRecord', function() {

    test('it should build update url from user id', async function(assert) {
      // when
      const snapshot = { adapterOptions: { } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.equal(url.endsWith('/users/123'), true);
    });

    test('it should redirect to pix-certif-terms-of-service-acceptance', async function(assert) {
      // when
      const snapshot = { adapterOptions: { acceptPixCertifTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'user', snapshot);

      // then
      assert.equal(url.endsWith('/users/123/pix-certif-terms-of-service-acceptance'), true);
    });
  });

  module('#urlForQueryRecord', function() {

    test('it should build query url normally', async function(assert) {
      // when
      const query = {};
      const url = await adapter.urlForQueryRecord(query, 'user');

      // then
      assert.equal(url.endsWith('/users'), true);
    });

    test('it should build query URL with suffix /me', async function(assert) {
      // when
      const query = { me: 'anything' };
      const url = await adapter.urlForQueryRecord(query, 'user');

      // then
      assert.equal(url.endsWith('/users/me'), true);
    });

  });
});
