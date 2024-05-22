import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | authentication-method', function (hooks) {
  setupTest(hooks);

  module('#deleteRecord', function () {
    module('when reassign authentication method adapterOptions is passed', function () {
      test('should send a POST request to user authentication method endpoint', async function (assert) {
        // given
        const adapter = this.owner.lookup('adapter:authentication-method');
        sinon.stub(adapter, 'ajax');

        const targetUserId = 1;
        const originUserId = 123;
        const identityProvider = 'GAR';
        const adapterOptions = {
          reassignAuthenticationMethodToAnotherUser: true,
          targetUserId,
          originUserId,
          identityProvider,
        };

        // when
        await adapter.deleteRecord(null, { modelName: 'authentication-method' }, { id: 2, adapterOptions });

        // then
        const expectedUrl = 'http://localhost:3000/api/admin/users/123/authentication-methods/2';
        const expectedPayload = {
          data: {
            data: {
              attributes: { 'user-id': targetUserId },
            },
          },
        };
        sinon.assert.calledWith(adapter.ajax, expectedUrl, 'POST', expectedPayload);
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
