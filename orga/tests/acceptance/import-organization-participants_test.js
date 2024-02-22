import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { visit } from '@1024pix/ember-testing-library';

import { createUserManagingStudents, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

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
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    module('have access to upload file', function () {
      test('it should display success message and reload students', async function (assert) {
        // given
        const screen = await visit('/etudiants');

        // when
        await click(
          screen.getByRole('link', { name: this.intl.t('pages.sup-organization-participants.actions.import-file') }),
        );
        // then
        assert.strictEqual(currentURL(), '/import-participants');
      });
    });
  });

  module('When member', function (hooks) {
    hooks.beforeEach(async function () {
      user = createUserManagingStudents('MEMBER', 'SUP');
      createPrescriberByUser(user);

      await authenticateSession(user.id);
    });

    test('it should redirect to default page', async function (assert) {
      // when
      await visit('/import-participants');

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });
  });
});
