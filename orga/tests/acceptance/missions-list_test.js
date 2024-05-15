import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import {
  createPrescriberByUser,
  createPrescriberForOrganization,
  createUserWithMembershipAndTermsOfServiceAccepted,
} from '../helpers/test-init';

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
    test('user should access to the list of the missions and the link to pix-junior', async function (assert) {
      // given
      const user = createPrescriberForOrganization(
        { lang: 'fr', pixOrgaTermsOfServiceAccepted: true },
        { schoolCode: 'BLABLA123' },
        'MEMBER',
        {
          MISSIONS_MANAGEMENT: true,
        },
      );
      await authenticateSession(user.id);

      server.create('mission', { name: 'Super Mission', competenceName: 'Super competence' });

      // when
      const screen = await visit('/missions');

      // then
      assert.dom(screen.getByText('Super Mission')).exists();
      assert.dom(screen.getByText('Super competence')).exists();
      assert
        .dom(
          screen.getByRole('link', { name: this.intl.t('pages.missions.list.banner.copypaste-container.import-text') }),
        )
        .hasAttribute('href', 'http://localhost/schools/BLABLA123');
    });

    module('display divisions', function () {
      test('should display division list when there are some', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        const prescriber = createPrescriberByUser({ user });
        prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
        await authenticateSession(user.id);

        server.create('mission', { name: 'Super Mission', competenceName: 'Super competence', startedBy: 'CM2' });

        // when
        const screen = await visit('/missions');

        // then
        assert.dom(screen.getByText('CM2')).exists();
      });
      test('should display no division message when there are none', async function (assert) {
        // given
        const user = createUserWithMembershipAndTermsOfServiceAccepted();
        const prescriber = createPrescriberByUser({ user });
        prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
        await authenticateSession(user.id);

        server.create('mission', { name: 'Super Mission', competenceName: 'Super competence', startedBy: '' });

        // when
        const screen = await visit('/missions');

        // then
        assert.dom(screen.getByText(this.intl.t('pages.missions.list.no-division'))).exists();
      });
    });
    module('display import button', function () {
      test('should display import button if user is admin of the current school', async function (assert) {
        // given
        const user = createPrescriberForOrganization({ lang: 'fr', pixOrgaTermsOfServiceAccepted: true }, {}, 'ADMIN', {
          MISSIONS_MANAGEMENT: true,
        });
        await authenticateSession(user.id);
        server.create('mission', { name: 'Super Mission', competenceName: 'Super competence', startedBy: '' });

        // when
        const screen = await visit('/missions');
        // then
        assert
          .dom(
            screen.getByRole('link', {
              name: this.intl.t('pages.missions.list.banner.admin.import-text'),
            }),
          )
          .hasAttribute('href', '/import-participants');
      });
      test('should not display import button if user is member of the current school', async function (assert) {
        // given
        const user = createPrescriberForOrganization(
          { lang: 'fr', pixOrgaTermsOfServiceAccepted: true },
          {},
          'MEMBER',
          {
            MISSIONS_MANAGEMENT: true,
          },
        );
        await authenticateSession(user.id);

        server.create('mission', { name: 'Super Mission', competenceName: 'Super competence', startedBy: '' });

        // when
        const screen = await visit('/missions');

        // then
        assert
          .dom(
            screen.queryByRole('link', {
              name: this.intl.t('pages.missions.list.banner.admin.import-text'),
            }),
          )
          .doesNotExist();
      });
    });

    test('it should see empty state when there is no mission', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser({ user });
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);

      // when
      const screen = await visit('/missions');
      // then
      assert.deepEqual(currentURL(), '/missions');
      assert.dom(screen.getByText(this.intl.t('pages.missions.list.empty-state'))).exists();
    });

    test('user should access to detail when he click on a row', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser({ user });
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
