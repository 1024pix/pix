import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { within } from '@1024pix/ember-testing-library';
import { click, currentURL, visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Campaign Details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      server.create('campaign', { id: 1 });

      // when
      await visit('/campagnes/1');

      // then
      assert.strictEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('it should go to campaigns', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });

      // when
      await visitScreen('/campagnes/1');
      await click(within(document.querySelector('main')).getByRole('link', { name: t('navigation.main.campaigns') }));

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('[A11Y] it should contain accessibility aria-label nav', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });
      server.create('campaign-participant-activity', { firstName: 'toto' });

      // when
      const screen = await visitScreen('/campagnes/1');

      // then
      assert.dom(screen.getByLabelText('Navigation principale')).exists();
      assert.dom(screen.getByLabelText("Navigation de la section détails d'une campagne")).exists();
      assert.dom(screen.getByLabelText('Navigation de pied de page')).exists();
    });
  });
});
