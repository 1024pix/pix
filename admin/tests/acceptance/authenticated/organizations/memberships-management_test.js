import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit, clickByName, selectByLabelAndOption } from '@1024pix/ember-testing-library';

module('Acceptance | Organizations | Memberships management', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let organization;

  hooks.beforeEach(async function () {
    const user = server.create('user');
    organization = this.server.create('organization');
    await createAuthenticateSession({ userId: user.id });
  });

  test('should redirect to organization team page', async function (assert) {
    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.strictEqual(currentURL(), `/organizations/${organization.id}/team`);
  });

  module('listing members', function (hooks) {
    hooks.beforeEach(async function () {
      server.createList('membership', 12);
    });

    test('it should display the current filter when memberships are filtered by firstName', async function (assert) {
      // when
      const screen = await visit(`/organizations/${organization.id}/team?firstName=sav`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher par prénom' })).hasValue('sav');
    });

    test('it should display the current filter when organizations are filtered by lastName', async function (assert) {
      // when
      const screen = await visit(`/organizations/${organization.id}/team?lastName=tro`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher par nom' })).hasValue('tro');
    });

    test('it should display the current filter when organizations are filtered by email', async function (assert) {
      // when
      const screen = await visit(`/organizations/${organization.id}/team?email=fri`);

      // then
      assert.dom(screen.getByRole('textbox', { name: 'Rechercher par adresse e-mail' })).hasValue('fri');
    });

    test('it should display the current filter when organizations are filtered by role', async function (assert) {
      // when
      const screen = await visit(`/organizations/${organization.id}/team?organizationRole=ADMIN`);

      // then
      assert.dom(screen.getByRole('combobox', { name: 'Rechercher par rôle' })).hasValue('ADMIN');
    });

    test('it should redirect to user details on user id click', async function (assert) {
      // given
      const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
      this.server.create('membership', { user, organization });

      // when
      const screen = await visit(`/organizations/${organization.id}/team`);

      // when
      await click(screen.getByRole('link', { name: '2' }));

      // then
      assert.strictEqual(currentURL(), '/users/2');
    });
  });

  module('adding a member', function () {
    test('should create a user membership and display it in the list', async function (assert) {
      // given
      this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });

      // when
      const screen = await visit(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'user@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.dom(screen.getByText('John')).exists();
      assert.dom(screen.getByText('Doe')).exists();
      assert.dom(screen.getByText('user@example.com')).exists();
      assert.dom(screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" })).hasNoValue();
    });

    test('should not do anything when the membership was already existing for given user email and organization', async function (assert) {
      // given
      const user = this.server.create('user', {
        firstName: 'Denise',
        lastName: 'Ter Hegg',
        email: 'denise@example.com',
      });
      this.server.create('membership', { user, organization });

      // when
      const screen = await visit(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'denise@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.strictEqual(screen.getAllByLabelText('Membre').length, 1);
      assert
        .dom(screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }))
        .hasValue('denise@example.com');
    });

    test('should not do anything when no user was found for the input email', async function (assert) {
      // given
      const user = this.server.create('user', { firstName: 'Erica', lastName: 'Caouette', email: 'erica@example.com' });
      this.server.create('membership', { user, organization });

      // when
      const screen = await visit(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'unexisting@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.strictEqual(screen.getAllByLabelText('Membre').length, 1);
      assert.dom(screen.getByText('Erica')).exists();
      assert
        .dom(screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }))
        .hasValue('unexisting@example.com');
    });
  });

  module("editing a member's role", function (hooks) {
    let membership;

    hooks.beforeEach(async function () {
      const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
      membership = this.server.create('membership', { organizationRole: 'ADMIN', user, organization });
    });

    test("should update member's role", async function (assert) {
      // given / when
      const screen = await visit(`/organizations/${organization.id}/team`);
      await clickByName('Modifier le rôle');
      await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
      await clickByName('Enregistrer');

      // then
      assert.strictEqual(membership.organizationRole, 'MEMBER');
      assert.dom(screen.getByText('Le rôle du membre a été mis à jour avec succès.')).exists();
    });
  });

  module('deactivating a member', function (hooks) {
    hooks.beforeEach(async function () {
      const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
      this.server.create('membership', { organizationRole: 'ADMIN', user, organization });
    });

    test('should deactivate a member', async function (assert) {
      // given
      const screen = await visit(`/organizations/${organization.id}/team`);
      await clickByName('Désactiver le membre');

      // when
      await clickByName('Confirmer');

      // then
      assert.dom(screen.getByText('Le membre a été désactivé avec succès.')).exists();
      assert.dom(screen.getByText('Aucun résultat')).exists();
    });
  });
});
