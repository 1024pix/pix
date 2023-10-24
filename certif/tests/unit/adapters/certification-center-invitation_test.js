import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | certification-center-invitation', function (hooks) {
  setupTest(hooks);

  module('#urlForFindAll', function () {
    test('builds request pending invitations url with dynamic certification-center-id param', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-center-invitation');
      const certificationCenterId = 123;

      // when
      const url = await adapter.urlForFindAll('certification-center-invitation', {
        adapterOptions: { certificationCenterId },
      });

      // then
      assert.true(url.endsWith(`/certification-centers/${certificationCenterId}/invitations`));
    });
  });

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

  module('#sendInvitations', function (hooks) {
    let adapter;

    hooks.beforeEach(function () {
      adapter = this.owner.lookup('adapter:certification-center-invitation');
      sinon.stub(adapter, 'ajax');
    });

    hooks.afterEach(function () {
      adapter.ajax.restore();
    });

    test('sends certification center invitation', async function (assert) {
      // given
      const certificationCenterId = 1;
      const emails = ['naruto@konoha.net, sasuke@konoha.net'];
      const payload = {
        data: {
          attributes: {
            emails,
          },
        },
      };

      // when
      await adapter.sendInvitations({ certificationCenterId, emails });

      // then
      const expectedUrl = 'http://localhost:3000/api/certification-centers/1/invitations';
      assert.ok(adapter.ajax.calledWith(expectedUrl, 'POST', { data: payload }));
    });
  });
});
