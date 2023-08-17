import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { FINALIZED } from 'pix-admin/models/session';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | Session page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
  });

  module('Access', function () {
    test('Session page should be accessible from /certification/sessions', async function (assert) {
      // when
      await visitSessionsPage();

      // then
      assert.strictEqual(currentURL(), '/sessions/list/with-required-action');
    });
  });

  module('Rendering', function (hooks) {
    hooks.beforeEach(async function () {
      await visitSessionsPage();
    });

    test('Should not have a "Date de finalisation" section', async function (assert) {
      const session = this.server.create('session');

      // when
      const screen = await visit(`/sessions/${session.id}`);

      assert.dom(screen.getByText('Centre :')).exists();
      assert.dom(screen.queryByText('Date de finalisation :')).doesNotExist();
    });

    test('Should have "Date de finalisation" section', async function (assert) {
      const finalizedDate = new Date('2019-03-10T01:03:04Z');
      const session = this.server.create('session', { status: FINALIZED, finalizedAt: finalizedDate });

      // when
      const screen = await visit(`/sessions/${session.id}`);

      assert.dom(screen.getByText('Date de finalisation :')).exists();
      assert.dom(screen.getByText('10/03/2019')).exists();
    });

    test('Should remove "Résultats transmis au prescripteur" button', async function (assert) {
      const session = this.server.create('session', {
        status: FINALIZED,
        finalizedAt: new Date('2019-03-10T01:03:04Z'),
      });
      // when
      const screen = await visit(`/sessions/${session.id}`);
      await clickByName('Résultats transmis au prescripteur');

      assert.dom(screen.queryByRole('button', { name: 'Résultats transmis au prescripteur' })).doesNotExist();
    });
  });

  async function visitSessionsPage() {
    return visit('/sessions');
  }
});
