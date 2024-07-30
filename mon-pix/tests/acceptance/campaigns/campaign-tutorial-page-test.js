import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Campaigns | campaign-tutorial-page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks, 'fr');

  module('when a campaign is started for the first time', function (hooks) {
    let campaign;
    let user;
    let screen;

    hooks.beforeEach(async function () {
      //given
      campaign = server.create('campaign');
      user = server.create('user', { hasSeenAssessmentInstructions: false });
      await authenticate(user);

      // when
      screen = await visit(`/campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: this.intl.t('pages.campaign-landing.assessment.action') }));
    });

    test('displays the first tutorial page', async function (assert) {
      // then
      assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/didacticiel`);
      assert.dom(screen.getByRole('main', { heading: this.intl.t('pages.tutorial.title') })).exists();
      assert.dom(screen.getByText(this.intl.t('pages.tutorial.pages.page0.title'))).exists();
    });

    test('should start the campaign at the end of the tutorial', async function (assert) {
      // when
      await click(
        screen.getByRole('button', {
          name: this.intl.t('pages.tutorial.dot-action-title', { stepNumber: 5, stepsCount: 5 }),
        }),
      );
      await click(screen.getByRole('button', { name: this.intl.t('pages.tutorial.start') }));

      // then
      assert.ok(currentURL().startsWith('/assessments/'));
      assert.true(user.hasSeenAssessmentInstructions);
    });

    test('should start the campaign on pass action', async function (assert) {
      // when
      await click(screen.getByRole('button', { name: this.intl.t('pages.tutorial.pass') }));

      // then
      assert.ok(currentURL().startsWith('/assessments/'));
      assert.true(user.hasSeenAssessmentInstructions);
    });
  });

  module('when the user has already seen the tutorial', function () {
    test('should not render the tutorial page', async function (assert) {
      // given
      const campaign = server.create('campaign');
      const user = server.create('user', 'withEmail', { hasSeenAssessmentInstructions: true });
      await authenticate(user);

      // when
      const screen = await visit(`/campagnes/${campaign.code}`);
      await click(screen.getByRole('button', { name: this.intl.t('pages.campaign-landing.assessment.action') }));

      // then
      assert.ok(currentURL().startsWith('/assessments/'));
    });
  });
});
