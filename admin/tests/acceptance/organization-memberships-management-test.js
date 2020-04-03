import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | organization memberships management', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    await authenticateSession({ userId: 1 });
  });

  test('visiting /organizations/:id', async function(assert) {
    // given
    const organization = this.server.create('organization');

    // when
    await visit(`/organizations/${organization.id}`);

    // then
    assert.equal(currentURL(), `/organizations/${organization.id}`);
  });

  module('listing members', function() {

    test('should display the correct number of users', async function(assert) {
      // given
      const organization = this.server.create('organization');

      const userAlice = this.server.create('user', { firstName: 'Alice', lastName: 'Cencieuse', email: 'alice@example.com' });
      const userBob = this.server.create('user', { firstName: 'Bob', lastName: 'Harr', email: 'bob@example.com' });
      const userCharlie = this.server.create('user', { firstName: 'Charlie', lastName: 'Bideau', email: 'charlie@example.com' });

      this.server.create('membership', { organization, user: userAlice });
      this.server.create('membership', { organization, user: userBob });
      this.server.create('membership', { organization, user: userCharlie });

      // when
      await visit(`/organizations/${organization.id}`);

      // then
      assert.equal(this.element.querySelectorAll('div.member-list table > tbody > tr').length, 3);
      assert.dom('div.member-list').includesText('Alice');
      assert.dom('div.member-list').includesText('Bob');
      assert.dom('div.member-list').includesText('Charlie');
    });

    test('should display the correct user data', async function(assert) {
      // given
      const organization = this.server.create('organization');
      const user = this.server.create('user', { firstName: 'Denise', lastName: 'Ter Hegg', email: 'denise@example.com' });
      this.server.create('membership', { user, organization, organizationRole: 'ADMIN' });

      // when
      await visit(`/organizations/${organization.id}`);

      // then
      assert.equal(this.element.querySelectorAll('div.member-list table > thead > tr > th ').length, 10);

      assert.dom('div.member-list table > thead').includesText('Numéro du membre');
      assert.dom('div.member-list table > thead').includesText('Prénom');
      assert.dom('div.member-list table > thead').includesText('Nom');
      assert.dom('div.member-list table > thead').includesText('Courriel');
      assert.dom('div.member-list table > thead').includesText('Rôle');

      assert.dom('div.member-list table > tbody').includesText(user.id);
      assert.dom('div.member-list table > tbody').includesText('Denise');
      assert.dom('div.member-list table > tbody').includesText('Ter Hegg');
      assert.dom('div.member-list table > tbody').includesText('denise@example.com');
      assert.dom('div.member-list table > tbody').includesText('Administrateur');
    });

    test('should display the correct user data when the user is a MEMBER', async function(assert) {
      // given
      const organization = this.server.create('organization');
      const user = this.server.create('user', { firstName: 'Denise', lastName: 'Ter Hegg', email: 'denise@example.com' });
      this.server.create('membership', { user, organization, organizationRole: 'MEMBER' });

      // when
      await visit(`/organizations/${organization.id}`);

      // then
      assert.dom('div.member-list table > tbody').includesText('Membre');
    });
  });

  module('adding a member', function() {

    test('should create a user membership and display it in the list', async function(assert) {
      // given
      const organization = this.server.create('organization');
      this.server.create('user', { firstName: 'John', lastName: 'Doe', email: 'user@example.com' });

      // when
      await visit(`/organizations/${organization.id}`);
      await fillIn('#userEmailToAdd', 'user@example.com');
      await click('[aria-label="Ajouter un membre"] button');

      // then
      assert.dom('div.member-list').includesText('John');
      assert.dom('div.member-list').includesText('Doe');
      assert.dom('div.member-list').includesText('user@example.com');
      assert.dom('#userEmailToAdd').hasNoValue();
    });

    test('should not do anything when the membership was already existing for given user email and organization', async function(assert) {
      // given
      const organization = this.server.create('organization');
      const user = this.server.create('user', { firstName: 'Denise', lastName: 'Ter Hegg', email: 'denise@example.com' });
      this.server.create('membership', { user, organization });

      // when
      await visit(`/organizations/${organization.id}`);
      await fillIn('#userEmailToAdd', 'denise@example.com');
      await click('[aria-label="Ajouter un membre"] button');

      // then
      assert.equal(this.element.querySelectorAll('div.member-list table > tbody > tr').length, 1);
      assert.dom('div.member-list').includesText('Denise');
      assert.dom('#userEmailToAdd').hasValue('denise@example.com');
    });

    test('should not do anything when no user was found for the input email', async function(assert) {
      // given
      const organization = this.server.create('organization');
      const user = this.server.create('user', { firstName: 'Erica', lastName: 'Caouette', email: 'erica@example.com' });
      this.server.create('membership', { user, organization });

      // when
      await visit(`/organizations/${organization.id}`);
      await fillIn('#userEmailToAdd', 'unexisting@example.com');
      await click('[aria-label="Ajouter un membre"] button');

      // then
      assert.equal(this.element.querySelectorAll('div.member-list table > tbody > tr').length, 1);
      assert.dom('div.member-list').includesText('Erica');
      assert.dom('#userEmailToAdd').hasValue('unexisting@example.com');
    });
  });

  module('inviting a member', function() {

    test('should create an organization-invitation', async function(assert) {
      // given
      const organization = this.server.create('organization');

      // when
      await visit(`/organizations/${organization.id}`);
      await fillIn('#userEmailToInvite', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await click('[aria-label="Inviter un membre"] button');

      // then
      assert.dom('.c-notification__content:last-child').includesText('Un email a bien a été envoyé à l\'adresse user@example.com.');
      assert.dom('#userEmailToInvite').hasNoValue();
    });

    test('should display an error if the creation has failed', async function(assert) {
      // given
      const organization = this.server.create('organization');
      this.server.post('/organizations/:id/invitations', () => new Response(500, {}, { errors: [{ status: '500' }] }));

      // when
      await visit(`/organizations/${organization.id}`);
      await fillIn('#userEmailToInvite', 'user@example.com');
      this.element.querySelectorAll('.c-notification').forEach((element) => element.remove());

      await click('[aria-label="Inviter un membre"] button');

      // then
      assert.dom('.c-notification__content:last-child').includesText('Une erreur s’est produite, veuillez réessayer.');
    });
  });
});
