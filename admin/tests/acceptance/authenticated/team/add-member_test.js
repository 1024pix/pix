import { module, test } from 'qunit';
import { click, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { Response } from 'miragejs';

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
        screen.getByRole('textbox', { name: "Adresse e-mail professionnelle de l'agent Pix à rattacher" }),
        'chris@to.phe'
      );
      await click(screen.getByRole('button', { name: 'Donner accès à un agent Pix' }));

      // then
      assert.dom(screen.getByText('chris@to.phe')).exists();
      assert.dom(screen.getByText("L'agent christophe leclerc a dorénavant accès à Pix Admin")).exists();
      assert
        .dom(screen.getByRole('textbox', { name: "Adresse e-mail professionnelle de l'agent Pix à rattacher" }))
        .hasNoValue();
      assert.dom(screen.getByRole('table', { name: 'Liste des membres' })).containsText('christophe leclerc');
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
        screen.getByRole('textbox', { name: "Adresse e-mail professionnelle de l'agent Pix à rattacher" }),
        'marie.tim@example.net'
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
        () =>
          new Response(
            404,
            {},
            {
              errors: [
                {
                  status: '404',
                  code: 'USER_ACCOUNT_NOT_FOUND',
                  title: 'User not found',
                },
              ],
            }
          )
      );

      // when
      const screen = await visit('/equipe');
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail professionnelle de l'agent Pix à rattacher" }),
        'marie.tim@example.net'
      );
      await click(screen.getByRole('button', { name: 'Donner accès à un agent Pix' }));

      // then
      assert.dom(screen.getByText("Cet utilisateur n'existe pas.")).exists();
      assert.dom(screen.getByRole('table', { name: 'Liste des membres' })).doesNotContainText('marie.tim@example.net');
    });
  });
});
