import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | prescriber', (hooks) => {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:prescriber');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForQueryRecord', () => {

    test('should add /prescription inside prescriber query record', function(assert) {
      // when
      const url = adapter.urlForQueryRecord(2);

      // then
      assert.ok(url.endsWith('/prescription/prescribers/2'));
    });
  });

  module('#urlForUpdateRecord', () => {

    test('it should redirect to pix-orga-terms-of-service-acceptance', async function(assert) {
      // when
      const options = { adapterOptions: { acceptPixOrgaTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'prescriber', options);

      // then
      assert.equal(url.endsWith('/users/123/pix-orga-terms-of-service-acceptance'), true);
    });

    test('should redirect to lang', async function(assert) {
      // when
      const options = { adapterOptions: { lang: 'en' } };
      const url = await adapter.urlForUpdateRecord(123, 'prescriber', options);

      // then
      assert.equal(url.endsWith('/users/123/lang/en'), true);
    });
  });
});
