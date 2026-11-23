import { visit, within } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Team | Add member', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when admin member is super admin', function () {
    test('it should allow to assign a role to a Pix agent and display it in the list', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(this.server);
      this.server.create('user', {
        email: 'chris@to.phe',
        firstName: 'christophe',
        lastName: 'leclerc',
      });

      // when
      const screen = await visit('/equipe');
      await fillIn(
        screen.getByRole('textbox', { name: /Adresse e-mail professionnelle de l'agent Pix à rattacher/ }),
        'chris@to.phe',
      );
      await click(screen.getByRole('button', { name: 'Donner accès à un agent Pix' }));

      // then
      assert.dom(screen.getByText('chris@to.phe')).exists();
      assert.dom(screen.getByText("L'agent christophe leclerc a dorénavant accès à Pix Admin")).exists();
      assert
        .dom(screen.getByRole('textbox', { name: /Adresse e-mail professionnelle de l'agent Pix à rattacher/ }))
        .hasNoValue();

      const table = screen.getByRole('table', { name: t('pages.team.list.table.caption') });
      assert.dom(within(table).getByRole('cell', { name: 'christophe' })).exists();
      assert.dom(within(table).getByRole('cell', { name: 'leclerc' })).exists();
    });

    test('it should not allow to add a member that already exists', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(this.server);
      this.server.create('user', {
        firstName: 'Marie',
        lastName: 'Tim',
        email: 'marie.tim@example.net',
      });
      this.server.create('admin-member', {
        firstName: 'Marie',
        lastName: 'Tim',
        email: 'marie.tim@example.net',
        role: 'SUPER_ADMIN',
        isSuperAdmin: true,
      });

      // when
      const screen = await visit('/equipe');
      await fillIn(
        screen.getByRole('textbox', { name: /Adresse e-mail professionnelle de l'agent Pix à rattacher/ }),
        'marie.tim@example.net',
      );
      await click(screen.getByRole('button', { name: 'Donner accès à un agent Pix' }));

      // then
      assert.dom(screen.getByText('Cet agent a déjà accès')).exists();
    });

    test('it should not allow to add a user that does not exist', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(this.server);

      this.server.post(
        '/admin/admin-members',
        () => ({
          errors: [
            {
              status: '404',
              code: 'USER_ACCOUNT_NOT_FOUND',
              title: 'User not found',
            },
          ],
        }),
        404,
      );

      // when
      const screen = await visit('/equipe');
      await fillIn(
        screen.getByRole('textbox', { name: /Adresse e-mail professionnelle de l'agent Pix à rattacher/ }),
        'marie.tim@example.net',
      );
      await click(screen.getByRole('button', { name: 'Donner accès à un agent Pix' }));

      // then
      assert.dom(screen.getByText("Cet utilisateur n'existe pas.")).exists();
      const table = screen.getByRole('table', { name: t('pages.team.list.table.caption') });
      assert.dom(within(table).queryByRole('cell', { name: 'marie.tim@example.net' })).doesNotExist();
    });
  });
});
