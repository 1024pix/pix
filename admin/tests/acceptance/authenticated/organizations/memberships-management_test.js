import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit as visitScreen, clickByName, selectByLabelAndOption } from '@1024pix/ember-testing-library';

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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), `/organizations/${organization.id}/team`);
  });

  module('listing members', function (hooks) {
    hooks.beforeEach(async function () {
      server.createList('membership', 12);
    });

    test('it should display the current filter when memberships are filtered by firstName', async function (assert) {
      // when
      await visit(`/organizations/${organization.id}/team?firstName=sav`);

      // then
      assert.dom('#firstName').hasValue('sav');
    });

    test('it should display the current filter when organizations are filtered by lastName', async function (assert) {
      // when
      await visit(`/organizations/${organization.id}/team?lastName=tro`);

      // then
      assert.dom('#lastName').hasValue('tro');
    });

    test('it should display the current filter when organizations are filtered by email', async function (assert) {
      // when
      await visit(`/organizations/${organization.id}/team?email=fri`);

      // then
      assert.dom('#email').hasValue('fri');
    });

    test('it should display the current filter when organizations are filtered by role', async function (assert) {
      // when
      await visit(`/organizations/${organization.id}/team?organizationRole=ADMIN`);

      // then
      assert.dom('#organizationRole').hasValue('ADMIN');
    });
  });

  module('adding a member', function () {
    test('should create a user membership and display it in the list', async function (assert) {
      // given
      this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });

      // when
      const screen = await visitScreen(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'user@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.dom(screen.getByText('John')).exists();
      assert.dom(screen.getByText('Doe')).exists();
      assert.dom(screen.getByText('user@example.com')).exists();
      assert.dom('#userEmailToAdd').hasNoValue();
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
      const screen = await visitScreen(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'denise@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.strictEqual(screen.getAllByLabelText('Membre').length, 1);
      assert.dom(screen.getByText('Denise')).exists();
      assert.dom('#userEmailToAdd').hasValue('denise@example.com');
    });

    test('should not do anything when no user was found for the input email', async function (assert) {
      // given
      const user = this.server.create('user', { firstName: 'Erica', lastName: 'Caouette', email: 'erica@example.com' });
      this.server.create('membership', { user, organization });

      // when
      const screen = await visitScreen(`/organizations/${organization.id}`);
      await fillIn(
        screen.getByRole('textbox', { name: "Adresse e-mail de l'utilisateur à ajouter" }),
        'unexisting@example.com'
      );
      await clickByName('Ajouter un membre');

      // then
      assert.strictEqual(screen.getAllByLabelText('Membre').length, 1);
      assert.dom(screen.getByText('Erica')).exists();
      assert.dom('#userEmailToAdd').hasValue('unexisting@example.com');
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
      const screen = await visitScreen(`/organizations/${organization.id}/team`);
      await clickByName('Modifier le rôle');
      await selectByLabelAndOption('Sélectionner un rôle', 'MEMBER');
      await clickByName('Enregistrer');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(membership.organizationRole, 'MEMBER');
      assert.dom(screen.getByText('Le rôle du membre a été mis à jour avec succès.')).exists();
    });
  });

  module('deactivating a member', function (hooks) {
    hooks.beforeEach(async function () {
      const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
      this.server.create('membership', { organizationRole: 'ADMIN', user, organization });
    });

    test('should deactivate a member', async function (assert) {
      // given / when
      const screen = await visitScreen(`/organizations/${organization.id}/team`);
      await clickByName('Désactiver');
      await click('.modal-footer > button.btn-primary');

      // then
      assert.dom(screen.getByText('Le membre a été désactivé avec succès.')).exists();
      assert.dom(screen.getByText('Aucun résultat')).exists();
    });
  });
});
