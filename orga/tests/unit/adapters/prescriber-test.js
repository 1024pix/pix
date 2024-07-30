import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | prescriber', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:prescriber');
    const ajaxStub = () => resolve();
    adapter.set('ajax', ajaxStub);
  });

  module('#urlForFindRecord', function () {
    test('should add /prescription inside prescriber query record', function (assert) {
      // when
      const url = adapter.urlForFindRecord(2);

      // then
      assert.ok(url.endsWith('/prescription/prescribers/2'));
    });
  });

  module('#urlForUpdateRecord', function () {
    test('it should redirect to pix-orga-terms-of-service-acceptance', async function (assert) {
      // when
      const options = { adapterOptions: { acceptPixOrgaTermsOfService: true } };
      const url = await adapter.urlForUpdateRecord(123, 'prescriber', options);

      // then
      assert.true(url.endsWith('/users/123/pix-orga-terms-of-service-acceptance'));
    });

    test('should redirect to lang', async function (assert) {
      // when
      const options = { adapterOptions: { lang: 'en' } };
      const url = await adapter.urlForUpdateRecord(123, 'prescriber', options);

      // then
      assert.true(url.endsWith('/users/123/lang/en'));
    });
  });
});
