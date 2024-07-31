import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Campaigns | Skill Review', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;
  let campaign;
  let campaignParticipation;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
    campaign = server.create('campaign', { isArchived: false });
    campaignParticipation = server.create('campaign-participation', { campaign });
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
        const competenceResult = server.create('competence-result', {
          name: competenceResultName,
          masteryPercentage: 85,
        });
        server.create('campaign-participation-result', {
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

      module('with showNewResultPage feature toggle enabled', function () {
        test('should display evaluation results component', async function (assert) {
          // given
          server.create('feature-toggle', { id: 0, showNewResultPage: true });

          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.ok(screen.getByText(campaign.title));
          assert.dom(screen.getByRole('tablist')).exists();
        });
      });

      module('without showNewResultPage feature toggle enabled', function () {
        test('should display the old skill-review page', async function (assert) {
          // when
          const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

          // then
          assert.dom(screen.getByRole('banner')).exists();
        });
      });
    });
  });
});
