import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

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
      createPrescriberByUser({ user });
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
      createPrescriberByUser({ user });
      await authenticateSession(user.id);

      // when
      const screen = await visitScreen('/campagnes');

      //then
      assert.ok(screen.getByRole('link', { name: t('pages.campaigns-list.action.create') }));
    });

    test('it should show the two tabs: my campaigns and all campaigns', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      createPrescriberByUser({ user });
      server.create('campaign');

      await authenticateSession(user.id);

      // when
      const screen = await visitScreen('/campagnes');

      // then
      assert.ok(screen.getByRole('heading', { level: 1, name: t('pages.campaigns-list.title') }));
      assert.ok(screen.getByText(t('pages.campaigns-list.tabs.my-campaigns')));
      assert.ok(screen.getByText(t('pages.campaigns-list.tabs.all-campaigns')));
    });
  });
});
