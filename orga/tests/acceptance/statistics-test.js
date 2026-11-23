import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberForOrganization } from '../helpers/test-init';

module('Acceptance | Statistics', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
      // when
      await visit('/statistiques');

      // then
      assert.deepEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in and has cover rate feature', function () {
    test('user should access to page', async function (assert) {
      // given
      const user = createPrescriberForOrganization({ lang: 'fr' }, {}, 'ADMIN', {
        COVER_RATE: { active: true, params: null },
      });
      await authenticateSession(user.id);

      // when
      const screen = await visit('/statistiques');

      // then
      assert.ok(screen.getByRole('heading', { level: 1, name: t('pages.statistics.title') }));
      assert.ok(screen.getByRole('table'));
      assert.ok(screen.getAllByRole('cell'));
    });
  });
});
