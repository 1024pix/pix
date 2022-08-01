import { visit } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { contains } from '../helpers/contains';
import setupIntl from '../helpers/setup-intl';
import { clickByLabel } from '../helpers/click-by-label';

module('Acceptance | Fill in campaign code page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;

  hooks.beforeEach(async function () {
    user = server.create('user', 'withEmail');
  });

  module('When connected', function () {
    test('should disconnect when cliking on the link', async function (assert) {
      // given
      await authenticateByEmail(user);
      await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.warning-message-logout'));

      // then
      assert.equal(contains(user.firstName), null);
      assert.dom(contains(this.intl.t('navigation.not-logged.sign-in'))).exists();
    });
  });

  module('Explanation link', function () {
    test('should redirect on the right support page', async function (assert) {
      // given
      await authenticateByEmail(user);
      await visit('/campagnes');

      // when
      await clickByLabel(this.intl.t('pages.fill-in-campaign-code.explanation-message'));

      // then
      assert
        .dom(
          find(
            '[href="https://support.pix.org/fr/support/solutions/articles/15000029147-qu-est-ce-qu-un-code-parcours-et-comment-l-utiliser-"]'
          )
        )
        .exists();
      assert.dom(find('[target="_blank"]')).exists();
    });
  });
});
