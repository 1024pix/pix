import { module, test } from 'qunit';
import { currentURL, visit, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { within } from '@testing-library/dom';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

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
      createPrescriberByUser(user);

      await authenticateSession(user.id);

      server.create('campaign', { id: 1 });

      // when
      await visitScreen('/campagnes/1');
      await click(
        within(document.querySelector('main')).getByRole('link', { name: this.intl.t('navigation.main.campaigns') })
      );

      // then
      assert.strictEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('[A11Y] it should contain accessibility aria-label nav', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);

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
