import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import authenticateSession from '../helpers/authenticate-session';
import { setupApplicationTest } from 'ember-qunit';
import { currentSession } from 'ember-simple-auth/test-support';
import {
  createUserMembershipWithRole,
  createUserWithMembership,
  createUserWithMembershipAndTermsOfServiceAccepted,
  createUserManagingStudents,
  createPrescriberByUser,
  createPrescriberForOrganization,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authentication', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should redirect user to login page', async function (assert) {
      // when
      await visit('/');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/connexion');
      assert.notOk(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When prescriber is already logged in', function (hooks) {
    hooks.beforeEach(async () => {
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should redirect prescriber to campaign list page', async function (assert) {
      // when
      await visit('/connexion');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/les-miennes');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is still unauthenticated');
    });
  });

  module('When prescriber is logging in but has not accepted terms of service yet', function (hooks) {
    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembership();
      createPrescriberByUser(user);
    });

    test('it should redirect prescriber to the terms-of-service page', async function (assert) {
      // given
      await visit('/connexion');
      await fillByLabel('Adresse e-mail', user.email);
      await fillByLabel('Mot de passe', 'secret');

      // when
      await clickByName('Je me connecte');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/cgu');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should not show menu nor top bar', async function (assert) {
      // given
      server.create('campaign');

      await visit('/connexion');
      await fillByLabel('Adresse e-mail', user.email);
      await fillByLabel('Mot de passe', 'secret');

      // when
      await clickByName('Je me connecte');

      // then
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

      assert.dom('.sidebar').doesNotExist();
      assert.dom('.topbar').doesNotExist();
    });
  });

  module('When user is logging in and has accepted terms of service', function (hooks) {
    let user;

    hooks.beforeEach(() => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
    });

    test('it should redirect user to the campaigns list', async function (assert) {
      // given
      server.create('campaign');

      await visit('/connexion');
      await fillByLabel('Adresse e-mail', user.email);
      await fillByLabel('Mot de passe', 'secret');

      // when
      await clickByName('Je me connecte');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/les-miennes');
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
    });

    test('it should show user name', async function (assert) {
      // given
      server.create('campaign');

      await visit('/connexion');
      await fillByLabel('Adresse e-mail', user.email);
      await fillByLabel('Mot de passe', 'secret');

      // when
      await clickByName('Je me connecte');

      // then
      assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');

      assert.contains('Harry Cover');
    });
  });

  module('When prescriber is already authenticated', function () {
    module('When the organization has not credits and prescriber is ADMIN', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createPrescriberForOrganization(
          { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com' },
          { name: 'BRO & Evil Associates' },
          'ADMIN'
        );

        await authenticateSession(user.id);
      });

      test('should not show organization credit info', async function (assert) {
        // when
        await visit('/');
        // then
        assert.dom('.organization-credit-info').doesNotExist();
      });
    });

    module('When prescriber has already accepted terms of service', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('it should let prescriber access requested page', async function (assert) {
        // when
        await visit('/campagnes/creation');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/campagnes/creation');
        assert.ok(currentSession(this.application).get('isAuthenticated'), 'The user is authenticated');
      });

      test('it should display the organization linked to the connected prescriber', async function (assert) {
        // when
        await visit('/');

        // then
        assert.contains('BRO & Evil Associates (EXTBRO)');
      });

      test('it should redirect prescriber to the campaigns list on root url', async function (assert) {
        // when
        await visit('/');

        // then
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(currentURL(), '/campagnes/les-miennes');
      });
    });

    module('When prescriber is admin', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createUserMembershipWithRole('ADMIN');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('should display team menu', async function (assert) {
        // when
        await visit('/');
        // then
        assert.dom('.sidebar-nav a').exists({ count: 3 });
        assert.dom('.sidebar-nav').containsText('Campagnes');
        assert.dom('.sidebar-nav').containsText('Équipe');
        assert.dom('.sidebar-nav').containsText('Documentation');
        assert.dom('.sidebar-nav a:first-child').hasClass('active');
      });

      test('should redirect to team page', async function (assert) {
        // given
        await visit('/');

        // when
        await clickByName('Équipe');

        // then
        assert.dom('.sidebar-nav a:first-child').hasText('Campagnes');
        assert.dom('.sidebar-nav').containsText('Équipe');
        assert.dom('.sidebar-nav a:nth-child(2)').hasClass('active');
        assert.dom('.sidebar-nav a:first-child').hasNoClass('active');
      });

      module('When the organization has credits and prescriber is ADMIN', function (hooks) {
        hooks.beforeEach(async () => {
          const user = createPrescriberForOrganization(
            { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com' },
            { name: 'BRO & Evil Associates', credit: 10000 },
            'ADMIN'
          );

          await authenticateSession(user.id);
        });

        test('should show organization credit info', async function (assert) {
          // when
          await visit('/');
          // then
          assert.dom('.organization-credit-info').exists();
        });
      });

      module('When prescriber belongs to an organization that is managing students', function (hooks) {
        hooks.beforeEach(async () => {
          const user = createUserManagingStudents('ADMIN');
          createPrescriberByUser(user);

          await authenticateSession(user.id);
        });

        test('should display team and students menu', async function (assert) {
          // when
          await visit('/');

          // then
          assert.dom('.sidebar-nav a').exists({ count: 5 });
          assert.dom('.sidebar-nav').containsText('Campagnes');
          assert.dom('.sidebar-nav').containsText('Certifications');
          assert.dom('.sidebar-nav').containsText('Équipe');
          assert.dom('.sidebar-nav').containsText('Élèves');
          assert.dom('.sidebar-nav a:first-child ').hasClass('active');
        });

        test('should redirect to students page', async function (assert) {
          await visit('/');

          // when
          await clickByName('Élèves');

          // then
          assert.dom('.sidebar-nav').containsText('Campagnes');
          assert.dom('.sidebar-nav').containsText('Certifications');
          assert.dom('.sidebar-nav').containsText('Équipe');
          assert.dom('.sidebar-nav').containsText('Élèves');
          assert.dom('.sidebar-nav a:nth-child(3)').hasClass('active');
          assert.dom('.sidebar-nav a:first-child').hasNoClass('active');
        });

        test('should redirect to certifications page', async function (assert) {
          // when
          await visit('/');
          await clickByName('Certifications');

          // then
          assert.dom('.sidebar-nav').containsText('Certifications');
          assert.dom('.sidebar-nav a:nth-child(2)').hasClass('active');
          assert.dom('.sidebar-nav a:first-child').hasNoClass('active');
        });

        test('should have resources link', async function (assert) {
          // given
          await visit('/');

          // then
          assert.contains('Documentation');
        });
      });
    });

    module('When user is member', function (hooks) {
      hooks.beforeEach(async () => {
        const user = createUserMembershipWithRole('MEMBER');
        createPrescriberByUser(user);

        await authenticateSession(user.id);
      });

      test('should not display team menu', async function (assert) {
        // when
        await visit('/');

        // then

        assert.dom('.sidebar-nav a').exists({ count: 3 });
        assert.dom('.sidebar-nav').containsText('Campagnes');
        assert.dom('.sidebar-nav').containsText('Documentation');
        assert.dom('.sidebar-nav a:first-child ').hasClass('active');
      });

      module('When the organization has credits and prescriber is MEMBER', function (hooks) {
        hooks.beforeEach(async () => {
          const user = createPrescriberForOrganization(
            { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com' },
            { name: 'BRO & Evil Associates', credit: 10000 },
            'MEMBER'
          );

          await authenticateSession(user.id);
        });

        test('should not show credit info', async function (assert) {
          // when
          await visit('/');
          // then
          assert.dom('.organization-credit-info').doesNotExist();
        });
      });

      module('When user belongs to an organization that is managing students', function (hooks) {
        hooks.beforeEach(async () => {
          const user = createUserManagingStudents('MEMBER');
          createPrescriberByUser(user);

          await authenticateSession(user.id);
        });

        test('should display students menu', async function (assert) {
          // when
          await visit('/');

          // then
          assert.dom('.sidebar-nav a').exists({ count: 4 });
          assert.dom('.sidebar-nav').containsText('Campagnes');
          assert.dom('.sidebar-nav').containsText('Élèves');
          assert.dom('.sidebar-nav a:first-child ').hasClass('active');
        });
      });
    });

    test('should redirect to main page when trying to access /certifications URL', async function (assert) {
      // given
      const user = createPrescriberForOrganization(
        { firstName: 'Harry', lastName: 'Cover', email: 'harry@cover.com' },
        { name: 'BRO & Evil Associates' },
        'ADMIN'
      );

      await authenticateSession(user.id);

      // when
      await visit('/certifications');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/campagnes/les-miennes');
    });
  });
});
