import { clickByName, visit as visitScreen, waitForElementToBeRemoved } from '@1024pix/ember-testing-library';
import { click, currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import times from 'lodash/times';
import { module, test } from 'qunit';
import sinon from 'sinon';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser, createUserMembershipWithRole } from '../helpers/test-init';

module('Acceptance | Team List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/equipe');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
      // given
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
      // when
      const screen = await visitScreen('/equipe');

      // then
      assert.dom(screen.getByLabelText('Navigation principale')).exists();
      assert.dom(screen.getByLabelText('Navigation de la section équipe')).exists();
      assert.dom(screen.getByLabelText('Navigation de pied de page')).exists();
    });

    module('When prescriber is a member', function () {
      test('it should show title of team page', async function (assert) {
        // given
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser({ user });

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Équipe', { selector: 'h1' })).exists();
      });

      test('it should be possible to see only members list', async function (assert) {
        // given
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser({ user });

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.strictEqual(currentURL(), '/equipe/membres');
        assert.dom(screen.queryByLabelText('Membres')).isNotVisible();
        assert.dom(screen.queryByLabelText('Invitations')).isNotVisible();
        assert.dom(screen.queryByLabelText('Inviter un membre')).isNotVisible();
        assert.dom(screen.getByText('Rôle')).exists();
      });
    });

    module('When prescriber is an admin', function () {
      test('it should be accessible', async function (assert) {
        // given
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser({ user });

        await authenticateSession(user.id);

        // when
        await visit('/equipe/membres');

        // then
        assert.strictEqual(currentURL(), '/equipe/membres');
      });

      test('it should show title of team page', async function (assert) {
        // given
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser({ user });

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Équipe', { selector: 'h1' })).exists();
      });

      test('it should show members list, invitations list and add an invitation button', async function (assert) {
        // given
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser({ user });

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Inviter un membre')).exists();
        assert.dom(screen.getByText('Membres (1)')).exists();
        assert.dom(screen.getByText('Invitations (-)')).exists();
      });
    });

    module('when prescriber is one of the admins', function () {
      module('when prescriber wants to leave the organization', function () {
        test('leaves the organization and disconnects from the application', async function (assert) {
          // given
          const session = this.owner.lookup('service:session');
          sinon.stub(session, 'waitBeforeInvalidation');
          const organization = server.create('organization', {
            name: 'BRO & Evil Associates',
            documentationUrl: 'https://pix.fr',
          });

          const leavingUser = server.create('user', {
            firstName: 'Leaving',
            lastName: 'User',
            email: 'leaving@user.com',
            lang: 'fr',
            pixOrgaTermsOfServiceAccepted: true,
          });
          leavingUser.userOrgaSettings = server.create('user-orga-setting', { user: leavingUser, organization });
          leavingUser.memberships = [
            server.create('membership', {
              userId: leavingUser.id,
              organizationId: organization.id,
              organizationRole: 'ADMIN',
            }),
          ];
          createPrescriberByUser({ user: leavingUser });

          const userLeft = server.create('user', {
            firstName: 'Left',
            lastName: 'User',
            email: 'left@user.com',
            lang: 'fr',
            pixOrgaTermsOfServiceAccepted: true,
          });
          leavingUser.userOrgaSettings = server.create('user-orga-setting', { user: userLeft, organization });
          leavingUser.memberships = [
            server.create('membership', {
              userId: userLeft.id,
              organizationId: organization.id,
              organizationRole: 'ADMIN',
            }),
          ];
          createPrescriberByUser({ user: userLeft });

          await authenticateSession(leavingUser.id);
          const screen = await visitScreen('/equipe');

          await click(screen.getAllByRole('button', { name: 'Gérer' })[0]);
          await click(screen.getByRole('button', { name: 'Quitter cet espace Pix Orga' }));
          await screen.findByRole('dialog');

          // when
          await click(screen.getByRole('button', { name: 'Confirmer' }));

          await waitForElementToBeRemoved(() => screen.queryByRole('dialog'));

          // then
          assert.true(session.waitBeforeInvalidation.called);
          assert.false(currentSession().get('isAuthenticated'));
        });
      });
    });
  });

  module('When the prescriber comes back to this route', function () {
    test('it should land on first page', async function (assert) {
      // given
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      const organizationId = server.db.organizations[0].id;
      times(10, () => {
        server.create('membership', {
          organizationId,
          createdAt: new Date(),
        });
      });
      await visit('/equipe/membres?pageNumber=2');
      await visit('/campagnes');

      // when
      await clickByName('Équipe');

      // then
      assert.strictEqual(currentURL(), '/equipe/membres');
    });
  });
});
