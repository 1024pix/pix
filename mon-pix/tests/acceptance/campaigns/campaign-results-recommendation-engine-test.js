import { visit, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

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
      let training;

      hooks.beforeEach(function () {
        training = server.create('training', {
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

      test('should track page and card information', async function (assert) {
        // given
        const trackEventStub = sinon.stub();
        const trackPageStub = sinon.stub();

        class MetricsStubService extends Service {
          trackPage = trackPageStub;
          trackEvent = trackEventStub;
        }

        this.owner.register('service:pix-metrics', MetricsStubService);

        // when
        const screen = await visit(`/campagnes/${campaign.code}/evaluation/resultats`);
        const metricsService = this.owner.lookup('service:metrics');

        // then
        sinon.assert.calledOnceWith(trackPageStub);
        assert.strictEqual(metricsService.context.code, campaign.code);

        sinon.assert.calledWithExactly(
          trackEventStub,
          'Moteur de reco - Affichage du contenu formatif sur la page de résultats',
          {
            trainingId: training.id,
            position: 1,
          },
        );

        // when
        await click(
          screen.getByRole('button', {
            name: t('pages.skill-review.recommended-engine.training-card.aria-label'),
          }),
        );
        await screen.findByRole('dialog');

        // then
        sinon.assert.calledWithExactly(trackEventStub, 'Moteur de reco - Clic sur la carte du contenu formatif', {
          trainingId: training.id,
        });

        // when
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.objectives') }));

        // then
        sinon.assert.calledWithExactly(
          trackEventStub,
          "Moteur de reco - Clic sur l'accordéon de la modale du contenu formatif",
          {
            trainingId: training.id,
            accordionName: 'OBJECTIVES',
          },
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.objectives') }));
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.objectives') }));

        // then
        sinon.assert.callCount(trackEventStub, 4);

        // when
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.program') }));

        // then
        sinon.assert.calledWithExactly(
          trackEventStub,
          "Moteur de reco - Clic sur l'accordéon de la modale du contenu formatif",
          {
            trainingId: training.id,
            accordionName: 'PROGRAM',
          },
        );

        // when
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.program') }));
        await click(screen.getByRole('button', { name: t('pages.skill-review.recommended-engine.modal.program') }));

        // then
        sinon.assert.callCount(trackEventStub, 5);

        // when
        await click(
          screen.getByRole('link', {
            name: `${t('pages.skill-review.recommended-engine.modal.actions.discover-program')} ${t('navigation.external-link-title')}`,
          }),
        );

        // then
        sinon.assert.calledWithExactly(
          trackEventStub,
          'Moteur de reco - Clic sur le bouton "Découvrir le programme/module"',
          {
            trainingId: training.id,
          },
        );
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
