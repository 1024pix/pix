import { clickByName, visit } from '@1024pix/ember-testing-library';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | user-account | delete-account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user can self-delete their account', function () {
    test('it deletes their account', async function (assert) {
      // given
      const userDetails = { email: 'john.doe@example.net', username: 'john.doe0101' };
      const user = server.create('user', 'withCanSelfDeleteAccount', userDetails);
      await authenticate(user);

      // when
      const screen = await visit('/mon-compte/delete-account');

      // then
      const title = await screen.findByRole('heading', { name: t('pages.user-account.delete-account.title') });
      assert.dom(title).exists();

      await clickByName(t('pages.user-account.delete-account.actions.delete'));

      const modalTitle = await screen.findByRole('heading', {
        name: t('pages.user-account.delete-account.modal.title'),
      });
      assert.dom(modalTitle).exists();
    });
  });

  module('when user cannot self-delete their account', function () {
    test('it is redirected to account personal information page', async function (assert) {
      // given
      const user = server.create('user');
      await authenticate(user);

      // when
      const screen = await visit('/mon-compte/delete-account');

      // then
      assert.ok(screen.getByText(t('pages.user-account.personal-information.first-name')));
    });
  });
});
