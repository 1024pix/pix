import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Campaign List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
      // when
      await visitScreen('/campagnes');

      // then
      assert.deepEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in', function () {
    test('it should be accessible for an authenticated prescriber', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
      await authenticateSession(user.id);

      server.create('campaign');

      // when
      await visitScreen('/campagnes');

      // then
      assert.deepEqual(currentURL(), '/campagnes/les-miennes');
    });

    test('it should show title indicate than prescriber can create a campaign', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
      await authenticateSession(user.id);

      // when
      const screen = await visitScreen('/campagnes');

      // then
      assert.ok(screen.getByRole('heading', 'Créez votre première campagne'));
    });

    test('it should show the two tabs: my campaigns and all campaigns', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser(user);
      server.create('campaign');

      await authenticateSession(user.id);

      // when
      const screen = await visitScreen('/campagnes');

      // then
      assert.ok(screen.getByRole('heading', this.intl.t('pages.campaigns-list.title')));
      assert.ok(screen.getByText(this.intl.t('pages.campaigns-list.tabs.my-campaigns')));
      assert.ok(screen.getByText(this.intl.t('pages.campaigns-list.tabs.all-campaigns')));
    });
  });
});
