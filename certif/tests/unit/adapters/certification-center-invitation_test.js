import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | certification-center-invitation', function (hooks) {
  setupTest(hooks);

  module('#urlForQueryRecord', function () {
    module('when there is an "invitationId" and a "code" attributes in query', function () {
      test('builds certification-center-invitation url with dynamic invitationId', async function (assert) {
        // given
        const adapter = this.owner.lookup('adapter:certification-center-invitation');
        const invitationId = 123;
        const query = { code: 'ABCDEF', invitationId };

        // when
        const url = await adapter.urlForQueryRecord(query);

        // then
        assert.true(url.endsWith(`/certification-center-invitations/${invitationId}`));
      });
    });

    module('when there is no "invitationId" attribute in query', function () {
      test('builds default url', async function (assert) {
        // given
        const adapter = this.owner.lookup('adapter:certification-center-invitation');

        // when
        const url = await adapter.urlForQueryRecord({});

        // then
        assert.true(url.endsWith('api'));
      });
    });
  });
});
