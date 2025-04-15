import { render, within } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { waitForDialog, waitForDialogClose } from '../../../../../helpers/wait-for';

module('Integration | Components | Routes | Campaigns | Assessment | Evaluation Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  hooks.beforeEach(async function () {
    // given
    const store = this.owner.lookup('service:store');

    const campaign = store.createRecord('campaign', {
      title: 'Campaign title',
    });

    this.set('model', {
      campaign,
      campaignParticipationResult: { campaignParticipationBadges: [], competenceResults: [] },
      trainings: [],
    });
  });

  test('it should display a header', async function (assert) {
    // when
    screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

    // then
    assert.dom(screen.getByRole('heading', { name: /Campaign title/ })).exists();
  });

  test('it should display a hero', async function (assert) {
    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

    // then
    assert.dom(screen.getByRole('heading', { name: /Bravo/ })).exists();
  });

  module('when the campaign has trainings or badges', function () {
    test('it should display a tablist', async function (assert) {
      // given
      this.model.trainings = [{ duration: { days: 1, hours: 1, minutes: 1 } }];

      // when
      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      // then
      assert.dom(screen.getByRole('tablist', { name: t('pages.skill-review.tabs.aria-label') })).exists();
    });
  });

  module('when the campaign is shared and has trainings', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      this.model.trainings = [{ duration: { days: 1, hours: 1, minutes: 1 } }];
      this.model.campaignParticipationResult.isShared = true;
      this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
    });

    test('it should display the training button', async function (assert) {
      // when
      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: /Voir les formations/ })).isVisible();
    });

    test('when the training button is clicked, it should set trainings tab active', async function (assert) {
      // when
      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      // then
      await click(screen.getByRole('button', { name: /Voir les formations/ }));
      assert
        .dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }))
        .hasAttribute('aria-selected', 'true');
    });
  });

  module('when the campaign has not been shared yet and has trainings', function () {
    module('when clicking on the share results button in the "formations" tab', function () {
      test('it should display the evaluation-sent-results modal with first 3 trainings', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isResultsSharedModalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        this.model.trainings = generateTrainings(4);
        this.model.campaignParticipationResult.isShared = false;
        this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
        this.model.campaign.isForAbsoluteNovice = false;

        const campaignParticipationResultService = this.owner.lookup('service:campaign-participation-result');
        const shareStub = sinon.stub(campaignParticipationResultService, 'share');
        shareStub.resolves();

        // when
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        await click(screen.queryByRole('tab', { name: 'Formations' }));
        const trainingsDialog = await screen.getByRole('dialog');
        await click(within(trainingsDialog).queryByRole('button', { name: t('pages.skill-review.actions.send') }));
        await waitForDialogClose();
        const sharedResultsModal = await screen.getByRole('dialog', { name: 'Résultats partagés' });

        // then
        assert.dom(await screen.findByRole('button', { name: 'Fermer et revenir aux résultats' })).exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 1 youhou' }))
          .exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 2 youhou' }))
          .exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 3 youhou' }))
          .exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 4 youhou' }))
          .doesNotExist();
      });

      module('when feature_toggle ‘isResultsSharedModalEnabled‘ is false', function () {
        test('it should not display the evaluation-sent-results modal', async function (assert) {
          // given
          class FeatureTogglesStub extends Service {
            featureToggles = { isResultsSharedModalEnabled: false };
          }
          this.owner.register('service:featureToggles', FeatureTogglesStub);
          this.model.trainings = generateTrainings(3);
          this.model.campaignParticipationResult.isShared = false;
          this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
          this.model.campaign.isForAbsoluteNovice = false;

          const campaignParticipationResultService = this.owner.lookup('service:campaign-participation-result');
          const shareStub = sinon.stub(campaignParticipationResultService, 'share');
          shareStub.resolves();

          // when
          screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
          await click(screen.queryByRole('tab', { name: 'Formations' }));
          const dialog = await screen.getByRole('dialog');
          await click(within(dialog).queryByRole('button', { name: t('pages.skill-review.actions.send') }));

          // then
          assert.dom(screen.queryByRole('dialog', { name: 'Résultats partagés' })).doesNotExist();
        });
      });
    });
    module('when clicking on the share results button in hero', function () {
      test('it should display the evaluation-sent-results modal with first 3 trainings', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isResultsSharedModalEnabled: true };
        }
        this.owner.register('service:featureToggles', FeatureTogglesStub);
        this.model.trainings = generateTrainings(4);
        this.model.campaignParticipationResult.isShared = false;
        this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
        this.model.campaign.isForAbsoluteNovice = false;

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        const shareStub = sinon.stub(adapter, 'share');
        shareStub.resolves();

        // when
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        await click(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));
        await waitForDialog();
        const sharedResultsModal = await screen.getByRole('dialog', { name: 'Résultats partagés' });

        // then
        assert.dom(await screen.findByRole('button', { name: 'Fermer et revenir aux résultats' })).exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 1 youhou' }))
          .exists();
        assert
          .dom(within(sharedResultsModal).queryByRole('heading', { level: 3, name: 'Mon super training 4 youhou' }))
          .doesNotExist();
      });
    });
  });

  module('when campaign has not been shared yet and does not have trainings', function () {
    module('when clicking on the share results button', function () {
      test('it should display the evaluation-sent-results modal ', async function (assert) {
        // given
        class FeatureTogglesStub extends Service {
          featureToggles = { isResultsSharedModalEnabled: true };
        }

        this.owner.register('service:featureToggles', FeatureTogglesStub);
        this.model.trainings = [];
        this.model.campaignParticipationResult.isShared = false;
        this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
        this.model.campaign.isForAbsoluteNovice = false;

        const store = this.owner.lookup('service:store');
        const adapter = store.adapterFor('campaign-participation-result');
        const shareStub = sinon.stub(adapter, 'share');
        shareStub.resolves();

        // when
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        await click(screen.queryByRole('button', { name: t('pages.skill-review.actions.send') }));

        // then
        assert.dom(await screen.queryByRole('dialog', { name: 'Résultats partagés' })).doesNotExist();
      });
    });
  });
});

function generateTrainings(numberOfTrainings) {
  const results = [];

  for (let i = 1; i <= numberOfTrainings; i++) {
    const training = {
      title: `Mon super training ${i} youhou`,
      link: 'https://training.net/',
      type: 'webinaire',
      locale: 'fr-fr',
      duration: { hours: 6 },
      editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
      editorLogoUrl:
        'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
    };
    results.push(training);
  }

  return results;
}
