import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { clickByName, fillByLabel, visit, within } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | authenticated/users/get', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  async function buildAndAuthenticateUser(server, { email, username }) {
    const organizationLearner = server.create('organization-learner', { firstName: 'John' });
    const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
    const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
    const user = server.create('user', {
      'first-name': 'john',
      'last-name': 'harry',
      email,
      username,
      'is-authenticated-from-gar': false,
    });
    user.organizationLearners = [organizationLearner];
    user.authenticationMethods = [pixAuthenticationMethod, garAuthenticationMethod];
    user.save();
    server.create('admin-member', {
      userId: user.id,
      isSuperAdmin: true,
    });
    await createAuthenticateSession({ userId: user.id });

    return user;
  }

  test('should access on user details page by URL /users/:id', async function (assert) {
    // when
    const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
    await visit(`/users/${user.id}`);

    // then
    assert.deepEqual(currentURL(), `/users/${user.id}`);
  });

  test('should display user detail information page', async function (assert) {
    // given
    const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });

    // when
    const screen = await visit(`/users/${user.id}`);

    // then
    assert.dom(screen.getByRole('heading', { name: "Informations de l'utilisateur" })).exists();
    assert.dom(screen.getByRole('heading', { name: 'Méthodes de connexion' })).exists();
    assert.dom(screen.getByRole('heading', { name: 'Informations prescrit' })).exists();

    const userNavigation = within(screen.getByLabelText("Navigation de la section détails d'un utilisateur"));
    assert.dom(userNavigation.getByRole('link', { name: 'Détails' })).exists();
    assert.dom(userNavigation.getByRole('link', { name: 'Profil' })).exists();
    assert.dom(userNavigation.getByRole('link', { name: 'Participations' })).exists();
    assert
      .dom(userNavigation.getByRole('link', { name: 'Centres de certification auxquels appartient l´utilisateur' }))
      .exists();
  });

  test('should redirect to list users page when click page title', async function (assert) {
    // given
    const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
    await visit(`/users/${user.id}`);

    // when
    await clickByName('Tous les utilisateurs');

    // then
    assert.strictEqual(currentURL(), '/users/list');
  });

  module('when administrator click to edit users details', function () {
    test('should update user language, username, firstName, lastName and email', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, {
        email: 'john.harry@example.net',
        username: 'john.harry0101',
      });

      const screen = await visit(`/users/${user.id}`);
      await clickByName('Modifier');

      // when
      await fillByLabel('* Prénom :', 'john');
      await fillByLabel('* Nom :', 'doe');
      await fillByLabel('* Adresse e-mail :', 'john.doe@example.net');
      await fillByLabel('* Identifiant :', 'john.doe0101');
      await click(screen.getByRole('button', { name: 'Langue :' }));

      await screen.findByRole('listbox');
      await click(screen.getByRole('option', { name: 'Anglais' }));

      await clickByName('Editer');

      // then
      assert.dom(screen.getByText('john')).exists();
      assert.dom(screen.getByText('doe')).exists();
      assert.dom(screen.getByText('john.doe@example.net')).exists();
      assert.dom(screen.getByText('john.doe0101')).exists();
      assert.dom(screen.getByText('Langue : en')).exists();
    });
  });

  module('when administrator click on anonymize button and confirm modal', function () {
    test('should anonymize the user and remove all authentication methods', async function (assert) {
      // given
      await buildAndAuthenticateUser(this.server, {
        email: 'john.harry@example.net',
        username: 'john.harry121297',
      });

      const pixAuthenticationMethod = server.create('authentication-method', { identityProvider: 'PIX' });
      const garAuthenticationMethod = server.create('authentication-method', { identityProvider: 'GAR' });
      const organization = server.create('organization', {});
      const organizationMembership = server.create('organization-membership', {
        organizationId: organization.id,
        organizationName: 'Organization #1',
        organizationType: 'SCO',
      });
      const certificationCenter = server.create('certification-center', {
        name: 'Certification Center #1',
        type: 'SCO',
      });
      const certificationCenterMembership = server.create('certification-center-membership', {
        certificationCenter,
      });
      const userToAnonymise = server.create('user', {
        firstName: 'Jane',
        lastName: 'Harry',
        email: 'jane.harry@example.net',
        username: 'jane.harry050697',
        isAuthenticatedFromGar: false,
        authenticationMethods: [pixAuthenticationMethod, garAuthenticationMethod],
        organizationMemberships: [organizationMembership],
        certificationCenterMemberships: [certificationCenterMembership],
      });

      const screen = await visit(`/users/${userToAnonymise.id}`);
      await click(screen.getByRole('button', { name: 'Anonymiser cet utilisateur' }));

      await screen.findByRole('dialog');

      // when & then #1
      await click(screen.getByRole('button', { name: 'Confirmer' }));

      assert.dom(screen.getByText(`prenom_${userToAnonymise.id}`)).exists();
      assert.dom(screen.getByText(`nom_${userToAnonymise.id}`)).exists();
      assert.dom(screen.getByText(`email_${userToAnonymise.id}@example.net`)).exists();

      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec identifiant")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Médiacentre")).exists();
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion Partenaire OIDC")).exists();

      // when & then #2
      await click(screen.getByRole('link', { name: 'Organisations de l’utilisateur' }));
      assert.deepEqual(currentURL(), `/users/${userToAnonymise.id}/organizations`);
      assert.dom(screen.queryByText('Organization #1')).doesNotExist();

      // when & then #3
      await click(screen.getByLabelText('Centres de certification auxquels appartient l´utilisateur'));
      assert.deepEqual(currentURL(), `/users/${userToAnonymise.id}/certification-center-memberships`);
      assert.dom(screen.queryByText('Certification Center #1')).doesNotExist();
    });
  });

  module('when administrator click on unblock button', function () {
    test('should unblock the user', async function (assert) {
      // given
      await buildAndAuthenticateUser(this.server, {
        email: 'john.harry@example.net',
        username: 'john.harry121297',
      });
      const userLogin = server.create('user-login', {
        blockedAt: new Date('2021-02-01T03:00:00Z'),
        temporaryBlockedUntil: null,
        failureCount: 50,
      });
      const userToUnblock = server.create('user', {
        firstName: 'Jane',
        lastName: 'Harry',
        email: 'jane.harry@example.net',
        username: 'jane.harry050697',
        userLogin,
      });

      const screen = await visit(`/users/${userToUnblock.id}`);

      // when
      await clickByName("Débloquer l'utilisateur");

      // then
      assert.dom(screen.queryByText('Bloqué à :')).doesNotExist();
      assert.dom(screen.queryByRole('button', { name: "Débloquer l'utilisateur" })).doesNotExist();
    });
  });

  module('when administrator click on dissociate button', function () {
    test('should not display registration any more', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      const organizationName = 'Organisation_to_dissociate_of';
      const organizationLearnerToDissociate = this.server.create('organization-learner', {
        id: 10,
        organizationName,
        canBeDissociated: true,
      });
      user.organizationLearners.models.push(organizationLearnerToDissociate);
      user.save();

      const screen = await visit(`/users/${user.id}`);
      await click(screen.getByRole('button', { name: 'Dissocier' }));

      await screen.findByRole('dialog');

      // when
      await clickByName('Oui, je dissocie');

      // then
      assert.deepEqual(currentURL(), `/users/${user.id}`);
      assert.dom(screen.queryByText('Organisation_to_dissociate_of')).doesNotExist();
    });
  });

  module('when administrator click on remove authentication method button', function () {
    test('should not display remove link and display unchecked icon', async function (assert) {
      // given
      const user = await buildAndAuthenticateUser(this.server, { email: 'john.harry@example.net', username: null });
      const screen = await visit(`/users/${user.id}`);

      // when
      await click(screen.getAllByRole('button', { name: 'Supprimer' })[0]);

      await screen.findByRole('dialog');

      await clickByName('Oui, je supprime');

      // then
      assert.dom(screen.getByLabelText("L'utilisateur n'a pas de méthode de connexion avec adresse e-mail")).exists();
      assert.dom(screen.queryByText('Supprimer')).doesNotExist();
    });
  });

  module('when administrator click on delete participation button', function () {
    test('should mark participation as deleted', async function (assert) {
      // given
      const userParticipation = this.server.create('user-participation', { deletedAt: null });
      const user = server.create('user');
      user.participations = [userParticipation];
      user.save();
      this.server.create('admin-member', {
        userId: user.id,
        isSuperAdmin: true,
      });
      await createAuthenticateSession({ userId: user.id });

      const screen = await visit(`/users/${user.id}/participations`);

      // when
      await click(screen.getByRole('button', { name: 'Supprimer' }));

      await screen.findByRole('dialog');

      await clickByName('Oui, je supprime');

      // then
      assert.dom(screen.getByText('La participation du prescrit a été supprimée avec succès.')).exists();
      assert.dom(screen.getByText('12/12/2012 par')).exists();
      assert.dom(screen.getByRole('link', { name: 'Terry Dicule' })).exists();
    });
  });

  module('when administrator clicks on organizations tab', function () {
    test('should display user’s organizations', async function (assert) {
      // given
      const organization = this.server.create('organization');
      const organizationMembership1 = this.server.create('organization-membership', {
        organizationRole: 'MEMBER',
        organizationId: organization.id,
        organizationName: 'Dragon & Co',
        organizationType: 'PRO',
      });
      const memberOfAnOrganization = this.server.create('user', {
        organizationMemberships: [organizationMembership1],
      });

      const adminUser = this.server.create('user');
      this.server.create('admin-member', {
        userId: adminUser.id,
        isSuperAdmin: true,
      });
      await createAuthenticateSession({ userId: adminUser.id });

      const screen = await visit(`/users/${memberOfAnOrganization.id}`);

      // when
      await click(screen.getByRole('link', { name: 'Organisations de l’utilisateur' }));

      // then
      assert.deepEqual(currentURL(), `/users/${memberOfAnOrganization.id}/organizations`);
      assert.dom(screen.getByText('Dragon & Co')).exists();
      assert.dom(screen.getByText('Actions')).exists();
      assert.dom(screen.getByText('Modifier le rôle')).exists();
    });
  });

  module('when administrator clicks on certification centers tab', function () {
    test('should display user’s certification centers', async function (assert) {
      // given
      const certificationCenter = this.server.create('certification-center', {
        name: 'Centre Kaede',
        externalId: 'ABCDEF12345',
        type: 'SCO',
      });
      const certificationCenterMembership = this.server.create('certification-center-membership', {
        certificationCenter,
      });
      const user = this.server.create('user', {
        email: 'john.harry@example.net',
        certificationCenterMemberships: [certificationCenterMembership],
      });

      const adminUser = this.server.create('user');
      this.server.create('admin-member', {
        userId: adminUser.id,
        isSuperAdmin: true,
      });
      await createAuthenticateSession({ userId: adminUser.id });

      const screen = await visit(`/users/${user.id}`);

      // when
      await click(screen.getByLabelText('Centres de certification auxquels appartient l´utilisateur'));

      // then
      assert.deepEqual(currentURL(), `/users/${user.id}/certification-center-memberships`);
      assert.dom(screen.getByText('Centre Kaede')).exists();
    });
  });
});
