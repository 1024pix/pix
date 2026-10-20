import { within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateByEmail } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl.js';

module('Acceptance | User account', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('When in profile', function () {
    test('should open tests page when click on menu', async function (assert) {
      //given
      //
      server.create('campaign-participation-overview', { assessmentState: 'completed', campaignCode: 'CAMPAIGN' });

      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });

      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}` }));

      await click(
        await within(
          screen.getByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}` }).closest('div'),
        ).findByRole('link', { name: t('navigation.user.tests') }),
      );

      // then
      assert.strictEqual(currentURL(), '/mes-parcours');
    });

    test('should contain link to pix.fr/support', async function (assert) {
      // given
      server.create('campaign-participation-overview', { assessmentState: 'completed', campaignCode: 'CAMPAIGN' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);

      // when
      await click(screen.getByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}` }));

      // then
      const helplink = screen.getByRole('link', { name: 'Aide' }).getAttribute('href');
      assert.strictEqual(helplink, 'https://pix.fr/support');
    });

    test('should open My account page when click on menu', async function (assert) {
      //given
      server.create('campaign-participation-overview', { assessmentState: 'completed', campaignCode: 'CAMPAIGN' });
      const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
      const screen = await authenticateByEmail(user);
      await click(screen.getByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}` }));

      // when
      await click(screen.getByRole('link', { name: t('navigation.user.account') }));

      // then
      assert.strictEqual(currentURL(), '/mon-compte/informations-personnelles');
    });
  });

  test('should close menu when click outside', async function (assert) {
    // given
    server.create('campaign-participation-overview', { assessmentState: 'completed', campaignCode: 'CAMPAIGN' });
    const user = server.create('user', 'withEmail', 'withAssessmentParticipations', { firstName: 'Henri' });
    const screen = await authenticateByEmail(user);
    await click(screen.getByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}` }));

    // when
    await click(screen.getByRole('link', { name: 'Compétences' }));

    // then
    assert
      .dom(screen.queryByRole('button', { name: `Henri ${t('navigation.user-logged-menu.details')}`, expanded: false }))
      .exists();
  });
});
