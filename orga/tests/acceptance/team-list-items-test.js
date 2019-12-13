import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserMembershipWithRole, createAdminMembershipWithNbMembers } from '../helpers/test-init';
import { selectChoose } from 'ember-power-select/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Accept | Team List | Items', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When user is logged in', function() {

    module('When user is a admin of an organization without members', function(hooks) {

      hooks.beforeEach(async () => {
        user = createUserMembershipWithRole('ADMIN');

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should edition zone not be accessible', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 1 });
        assert.dom('#table-members tbody tr:first-child').hasText('Cover Harry Administrateur');
        assert.dom('#table-members tbody td').exists({ count: 4 });
        assert.dom('.zone-edit-role').doesNotExist();
        assert.dom('.zone-save-cancel-role').doesNotExist();
        assert.dom('#edit-organization-role').doesNotExist();
        assert.dom('#save-organization-role').doesNotExist();
        assert.dom('#cancel-update-organization-role').doesNotExist();

      });
    });

    module('When user is a admin of an organization with 4 members', function(hooks) {

      hooks.beforeEach(async () => {
        user = createAdminMembershipWithNbMembers(5);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should edition zone not be accessible for admin and accessible for 4 members', async function(assert) {
        // when
        await visit('/equipe');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 5 });
        assert.dom('#table-members tbody tr:first-child').hasText('Cover Harry Administrateur');
        //On affiche un td vide pour avoir un tableau cohérent
        assert.dom('#table-members tbody tr td').exists({ count: 20 });
        assert.dom('.zone-edit-role').exists({ count: 4 });
        assert.dom('#edit-organization-role').exists({ count: 4 });

        assert.dom('.zone-save-cancel-role').doesNotExist();
        assert.dom('#save-organization-role').doesNotExist();
        assert.dom('#cancel-update-organization-role').doesNotExist();
      });
    });

    module('When admin click on edit role for a membership with member role', function(hooks) {

      hooks.beforeEach(async () => {
        user = createAdminMembershipWithNbMembers(2);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should show update and save button, and show the drop down to select role to update', async function(assert) {
        // when
        await visit('/equipe');

        await click('#edit-organization-role');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 2 });
        assert.dom('#table-members tbody tr td').exists({ count: 8 });

        assert.dom('.zone-edit-role').doesNotExist();
        assert.dom('#edit-organization-role').doesNotExist();

        assert.dom('.zone-save-cancel-role').exists({ count: 1 });
        assert.dom('#save-organization-role').exists({ count: 1 });
        assert.dom('#cancel-update-organization-role').exists({ count: 1 });
      });
    });

    module('When admin change the role then click on update member role', function(hooks) {

      hooks.beforeEach(async () => {
        user = createAdminMembershipWithNbMembers(2);

        await authenticateSession({
          user_id: user.id,
          access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
          expires_in: 3600,
          token_type: 'Bearer token type',
        });
      });

      test('it should change the value of the drop down to Membre and save with the new value', async function(assert) {
        // when
        await visit('/equipe');

        await click('#edit-organization-role');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 2 });

        assert.dom('#table-members tbody tr:first-child td:nth-child(3)').hasText('Administrateur');
        assert.dom('#table-members tbody tr:first-child td:nth-child(4)').hasText('');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Selectionner le rôle');
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Enregistrer');

        await selectChoose('#selectOrganizationRole', 'Membre');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Membre');

        await click('#save-organization-role');

        assert.dom('#table-members tbody tr td').exists({ count: 8 });
        assert.dom('.zone-edit-role').exists({ count: 1 });
        assert.dom('#edit-organization-role').exists({ count: 1 });

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Membre');
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Modifier le rôle');

        assert.dom('.zone-save-cancel-role').doesNotExist();
        assert.dom('#save-organization-role').doesNotExist();
        assert.dom('#cancel-update-organization-role').doesNotExist();

      });

      test('it should change the value to Administrateur and save with the new value', async function(assert) {
        // when
        await visit('/equipe');

        await click('#edit-organization-role');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 2 });

        assert.dom('#table-members tbody tr:first-child td:nth-child(3)').hasText('Administrateur');
        assert.dom('#table-members tbody tr:first-child td:nth-child(4)').hasText('');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Selectionner le rôle');
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Enregistrer');

        await selectChoose('#selectOrganizationRole', 'Administrateur');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Administrateur');

        await click('#save-organization-role');

        assert.dom('#table-members tbody tr td').exists({ count: 8 });
        assert.dom('.zone-edit-role').exists({ count: 1 });
        assert.dom('#edit-organization-role').exists({ count: 1 });

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Administrateur');
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Modifier le rôle');

        assert.dom('.zone-save-cancel-role').doesNotExist();
        assert.dom('#save-organization-role').doesNotExist();
        assert.dom('#cancel-update-organization-role').doesNotExist();

      });

      test('it should cancel the update if the admin click on the cancel button', async function(assert) {
        // when
        await visit('/equipe');

        await click('#edit-organization-role');

        // then
        assert.equal(currentURL(), '/equipe');
        assert.dom('#table-members tbody tr').exists({ count: 2 });

        assert.dom('#table-members tbody tr:first-child td:nth-child(3)').hasText('Administrateur');
        assert.dom('#table-members tbody tr:first-child td:nth-child(4)').hasText('');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Selectionner le rôle');
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Enregistrer');

        await selectChoose('#selectOrganizationRole', 'Membre');

        await click('#cancel-update-organization-role');

        assert.dom('#table-members tbody tr:last-child td:nth-child(3)').hasText('Administrateur');

        assert.dom('#table-members tbody tr td').exists({ count: 8 });
        assert.dom('.zone-edit-role').exists({ count: 1 });
        assert.dom('#edit-organization-role').exists({ count: 1 });
        assert.dom('#table-members tbody tr:last-child td:nth-child(4)').hasText('Modifier le rôle');
        assert.dom('.zone-save-cancel-role').doesNotExist();
        assert.dom('#save-organization-role').doesNotExist();
        assert.dom('#cancel-update-organization-role').doesNotExist();

      });
    });
  });

});
