import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import authenticateSession from '../helpers/authenticate-session';
import { createUserWithMembershipAndTermsOfServiceAccepted, createPrescriberByUser } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Missions List', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When prescriber is not logged in', function () {
    test('it should not be accessible by an unauthenticated prescriber', async function (assert) {
      // when
      await visit('/missions');

      // then
      assert.deepEqual(currentURL(), '/connexion');
    });
  });

  module('When prescriber is logged in and has mission management feature', function () {
    test('user should access to the list of the missions', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser(user);
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);

      server.create('mission', { name: 'Super Mission', competenceName: 'Super competence' });

      // when
      const screen = await visit('/missions');

      // then
      assert.deepEqual(currentURL(), '/missions');
      assert.dom(screen.getByText('Super Mission')).exists();
      assert.dom(screen.getByText('Super competence')).exists();
    });

    test('it should see empty state when there is no mission', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser(user);
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);

      // when
      const screen = await visit('/missions');

      // then
      assert.deepEqual(currentURL(), '/missions');
      assert.dom(screen.getByText(this.intl.t('pages.missions.list.tab.empty-state'))).exists();
    });

    test('user should acces to detail when he click on a row', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser(user);
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);

      server.create('mission', { id: 1, name: 'Super Mission', competenceName: 'Super competence' });

      const screen = await visit('/missions');

      // when
      await click(screen.getByText('Super Mission'));

      // then
      assert.deepEqual(currentURL(), '/missions/1');
    });
  });
});
