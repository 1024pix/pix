import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit, clickByName } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { FINALIZED } from 'pix-admin/models/session';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Session page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('Access', function () {
    test('Session page should be accessible from /certification/sessions', async function (assert) {
      // when
      await visitSessionsPage();

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/list');
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
