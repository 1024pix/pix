import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/mirage';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Campaigns | Results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;
  let campaign;
  let campaignParticipation;

  hooks.beforeEach(function () {
    user = this.server.create('user', 'withEmail');
    campaign = this.server.create('campaign', { isArchived: false });
    campaignParticipation = this.server.create('campaign-participation', { campaign });
  });

  module('Display campaign results', function () {
    module('When user is not logged in', function (hooks) {
      hooks.beforeEach(async function () {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should be redirected to connection page', async function (assert) {
        // then
        assert.strictEqual(currentURL(), '/connexion');
      });
    });

    module('When user is logged in', function (hooks) {
      const competenceResultName = 'Competence Nom';

      hooks.beforeEach(async function () {
        // given
        await authenticate(user);
        const competenceResult = this.server.create('competence-result', {
          name: competenceResultName,
          masteryPercentage: 85,
        });
        this.server.create('campaign-participation-result', {
          id: campaignParticipation.id,
          competenceResults: [competenceResult],
          masteryPercentage: 85,
        });
      });

      test('should access to the result page', async function (assert) {
        // when
        await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
      });

      test('should display evaluation results component', async function (assert) {
        // given

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.ok(screen.getByText(campaign.title));
        assert
          .dom(screen.getByRole('heading', { name: t('pages.skill-review.tabs.results-details.title') }))
          .isVisible();
      });

      module('when the evaluation results have been shared', function () {
        test('should redirect to home page', async function (assert) {
          // given
          this.server.create('campaign-participation-result', {
            id: campaignParticipation.id,
            isShared: true,
          });
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // when
          await click(await screen.findByRole('link', { name: 'Quitter' }));

          // then
          assert.strictEqual(currentURL(), '/accueil');
        });
      });

      module('when the evaluation results have not been shared yet', function () {
        test('should open a confirm modal', async function (assert) {
          // given
          this.server.create('campaign-participation-result', {
            id: campaignParticipation.id,
            isShared: false,
          });
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // when
          await click(await screen.findByRole('button', { name: 'Quitter' }));

          // then
          const modalTitle = await screen.findByRole('heading', {
            name: 'Oups, vous n’avez pas encore envoyé vos résultats !',
          });
          assert.ok(screen.findByRole('dialog'));
          assert.ok(modalTitle);
        });
      });
    });
  });
});
