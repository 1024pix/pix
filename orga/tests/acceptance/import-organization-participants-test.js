import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Student Import', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.afterEach(function () {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });

  module('When admin', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('ADMIN', 'SUP');
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    module('have access to upload file', function () {
      test('navigate to import page', async function (assert) {
        // given
        const screen = await visit('/etudiants');

        // when
        await click(screen.getByRole('link', { name: t('components.organization-participants-header.import-button') }));
        // then
        assert.strictEqual(currentURL(), '/import-participants');
      });
    });
  });

  module('When member', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('MEMBER', 'SUP');
      createPrescriberByUser({ user });

      await authenticateSession(user.id);
    });

    test('it should redirect to home page', async function (assert) {
      // when
      await visit('/import-participants');

      // then
      assert.strictEqual(currentURL(), '/');
    });
  });
});
