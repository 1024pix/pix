import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { selectChoose } from 'ember-power-select/test-support/helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import clickByLabel from '../helpers/extended-ember-test-helpers/click-by-label';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

module('Acceptance | organization memberships management', function (hooks) {
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
      await clickByLabel('Ajouter un membre');

      // then
      assert.contains('John');
      assert.contains('Doe');
      assert.contains('user@example.com');
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
      await clickByLabel('Ajouter un membre');

      // then
      assert.equal(this.element.querySelectorAll('div[data-test-id="member-list"] table > tbody > tr').length, 1);
      assert.contains('Denise');
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
      await clickByLabel('Ajouter un membre');

      // then
      assert.equal(this.element.querySelectorAll('div[data-test-id="member-list"] table > tbody > tr').length, 1);
      assert.contains('Erica');
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
      await visit(`/organizations/${organization.id}/team`);
      await clickByLabel('Modifier le rôle');
      await selectChoose('[data-test-id="editable-cell"]', 'Membre');
      await clickByLabel('Enregistrer');

      // then
      assert.equal(membership.organizationRole, 'MEMBER');
      assert.contains('Le rôle du membre a été mis à jour avec succès.');
    });
  });

  module('deactivating a member', function (hooks) {
    hooks.beforeEach(async function () {
      const user = this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });
      this.server.create('membership', { organizationRole: 'ADMIN', user, organization });
    });

    test('should deactivate a member', async function (assert) {
      // given / when
      await visit(`/organizations/${organization.id}/team`);
      await clickByLabel('Désactiver');
      await click('.modal-footer > button.btn-primary');

      // then
      assert.contains('Le membre a été désactivé avec succès.');
      assert.contains('Aucun résultat');
    });
  });
});
