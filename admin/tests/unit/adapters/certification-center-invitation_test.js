import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import sinon from 'sinon';

module('Unit | Adapter | certification-center-invitation', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function () {
    test('should build url with certification center id as dynamic segment', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation');
      const snapshot = { adapterOptions: { certificationCenterId: 7 } };

      // when
      const url = adapter.urlForFindAll('certification-center-invitation', snapshot);

      // then
      assert.deepEqual(url, `${ENV.APP.API_HOST}/api/admin/certification-centers/7/invitations`);
    });
  });

  module('#queryRecord', function () {
    test('it builds request with specific payload and url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation');
      const store = this.owner.lookup('service:store');
      sinon.stub(adapter, 'ajax');
      const query = { certificationCenterId: 666, email: 'super@example.net', language: 'fr-fr', role: 'MEMBER' };

      // when
      adapter.queryRecord(store, 'certification-center-invitation', query);

      // then
      const expectedUrl = `${ENV.APP.API_HOST}/api/admin/certification-centers/666/invitations`;
      const expectedPayload = {
        data: { data: { attributes: { email: 'super@example.net', language: 'fr-fr', role: 'MEMBER' } } },
      };
      sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
      assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
    });
  });
});
