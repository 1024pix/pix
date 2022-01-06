import { module, test } from 'qunit';
import { currentURL, visit } from '@ember/test-helpers';
import { clickByName } from '@1024pix/ember-testing-library';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';

import { createUserMembershipWithRole, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import times from 'lodash/times';

module('Acceptance | Team List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let user;

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/equipe');

      // then
      assert.equal(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('[a11y] it should contain accessibility aria-label nav', async function (assert) {
      // given
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser(user);

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
        createPrescriberByUser(user);

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Équipe', { selector: 'h1' })).exists();
      });

      test('it should be possible to see only members list', async function (assert) {
        // given
        user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.equal(currentURL(), '/equipe/membres');
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
        createPrescriberByUser(user);

        await authenticateSession(user.id);

        // when
        await visit('/equipe/membres');

        // then
        assert.equal(currentURL(), '/equipe/membres');
      });

      test('it should show title of team page', async function (assert) {
        // given
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Équipe', { selector: 'h1' })).exists();
      });

      test('it should show members list, invitations list and add an invitation button', async function (assert) {
        // given
        user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession(user.id);

        // when
        const screen = await visitScreen('/equipe');

        // then
        assert.dom(screen.getByText('Inviter un membre')).exists();
        assert.dom(screen.getByText('Membres (1)')).exists();
        assert.dom(screen.getByText('Invitations (-)')).exists();
      });
    });
  });

  module('When the prescriber comes back to this route', function () {
    test('it should land on first page', async function (assert) {
      // given
      user = createUserMembershipWithRole('ADMIN');
      createPrescriberByUser(user);
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
      assert.equal(currentURL(), '/equipe/membres');
    });
  });
});
