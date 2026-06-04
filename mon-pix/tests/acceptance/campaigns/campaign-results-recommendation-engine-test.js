import { visit, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../../helpers/authentication';
import setupIntl from '../../helpers/setup-intl';

module('Acceptance | Campaigns | Results | Recommendation Engine', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  let user;
  let campaignParticipation;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('when campaign has recommendationEngine enabled', function (hooks) {
    let campaign;

    hooks.beforeEach(async function () {
      campaign = server.create('campaign', { isArchived: false, organizationId: 123, recommendationEngine: true });
      campaignParticipation = server.create('campaign-participation', { campaign });

      await authenticate(user);

      const competenceResult = server.create('competence-result', {
        name: 'Competence Nom',
        masteryPercentage: 75,
      });
      server.create('campaign-participation-result', {
        id: campaignParticipation.id,
        competenceResults: [competenceResult],
        masteryRate: 0.75,
        masteryPercentage: 75,
      });
    });

    test('should access the results page at the expected URL', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
    });

    test('should display the recommendation engine results page', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.dom('.evaluation-results-recommendation-engine').exists();
    });

    test('should not display the standard results page', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.dom('.evaluation-results:not(.evaluation-results-recommendation-engine)').doesNotExist();
    });

    module('when campaign has trainings', function (hooks) {
      hooks.beforeEach(function () {
        server.create('training', {
          campaignParticipation,
          title: 'Formation test',
          link: 'https://example.net/',
          type: 'webinaire',
          duration: { hours: 2, days: 1, minutes: 0 },
          deliveryMode: 'remote',
          editorName: 'Éditeur test',
          editorLogoUrl: 'https://example.net/logo.svg',
          objectives: ['Objectif 1'],
          program: 'Programme test',
          description: 'Description test',
          registrationRequired: false,
          isRelevant: null,
        });
      });

      test('in the card modal, saves the user feedback when thumb is clicked', async function (assert) {
        // given
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        const trainingCardButton = screen.getByRole('button', {
          name: t('pages.skill-review.recommended-engine.training-card.aria-label'),
        });
        await click(trainingCardButton);
        const modal = await screen.findByRole('dialog');

        // when
        assert.dom(within(modal).getByRole('button', { name: t('common.no') })).doesNotHaveClass('selected');
        assert.dom(within(modal).getByRole('button', { name: t('common.yes') })).doesNotHaveClass('selected');

        const thumbsUpButton = within(modal).getByRole('button', { name: t('common.yes') });
        const thumbsDownButton = within(modal).getByRole('button', { name: t('common.no') });
        assert.dom(thumbsUpButton).doesNotHaveClass('selected');
        assert.dom(thumbsDownButton).doesNotHaveClass('selected');

        // then
        await click(thumbsDownButton);
        assert.dom(thumbsUpButton).doesNotHaveClass('selected');
        assert.dom(thumbsDownButton).hasClass('selected');

        const actionButtons = within(modal).getByRole('list');
        await click(within(actionButtons).getByRole('button', { name: t('common.actions.close') }));
        await click(trainingCardButton);

        const reopenedModal = await screen.findByRole('dialog');
        assert.dom(within(reopenedModal).getByRole('button', { name: t('common.yes') })).doesNotHaveClass('selected');
        assert.dom(within(reopenedModal).getByRole('button', { name: t('common.no') })).hasClass('selected');
      });
    });

    module('when device is mobile', function () {
      test('should not display campaign title', async function (assert) {
        // given
        this.owner.register(
          'service:media',
          class MediaService extends Service {
            isMobile = true;
          },
        );

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

        // then
        assert.dom(screen.queryByText(campaign.title)).doesNotExist();
      });
    });
  });

  module('when campaign does not have recommendationEngine enabled', function (hooks) {
    let campaign;

    hooks.beforeEach(async function () {
      campaign = server.create('campaign', { isArchived: false, organizationId: 123, recommendationEngine: false });
      campaignParticipation = server.create('campaign-participation', { campaign });

      await authenticate(user);

      const competenceResult = server.create('competence-result', {
        name: 'Competence Nom',
        masteryPercentage: 75,
      });
      server.create('campaign-participation-result', {
        id: campaignParticipation.id,
        competenceResults: [competenceResult],
        masteryPercentage: 75,
      });
    });

    test('should access the results page at the expected URL', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.strictEqual(currentURL(), `/campagnes/${campaign.code}/evaluation/resultats`);
    });

    test('should display the standard results page', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.dom('.evaluation-results').exists();
    });

    test('should not display the recommendation engine results page', async function (assert) {
      // when
      await visit(`/campagnes/${campaign.code}/evaluation/resultats`);

      // then
      assert.dom('.evaluation-results-recommendation-engine').doesNotExist();
    });
  });
});
