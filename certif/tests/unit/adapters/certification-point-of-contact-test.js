import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | certification-point-of-contact', (hooks) => {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:certification-point-of-contact');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForUpdateRecord', () => {

    test('it should build specific url when adding option for acceptPixCertifTermsOfService', async function(assert) {
      // when
      const snapshot = { adapterOptions: { acceptPixCertifTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'certification-point-of-contact', snapshot);

      // then
      assert.equal(url.endsWith('/users/123/pix-certif-terms-of-service-acceptance'), true);
    });
  });
});
