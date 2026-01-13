import { render, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { stubConfigService, stubCurrentUserService } from '../../../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { waitForDialog, waitForDialogClose } from '../../../../../helpers/wait-for';

module('Integration | Components | Routes | Campaigns | Assessment | Evaluation Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  hooks.beforeEach(async function () {
    // given
    stubConfigService(this.owner);

    const store = this.owner.lookup('service:store');

    const campaign = store.createRecord('campaign', {
      title: 'Campaign title',
    });

    this.set('model', {
      campaign,
      campaignParticipationResult: { campaignParticipationBadges: [], competenceResults: [], reload: () => {} },
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
    screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

    assert.dom(screen.getByText(/Merci pour votre participation !/)).exists();
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
      this.model.showTrainings = true;
      this.model.trainings = [{ duration: { days: 1, hours: 1, minutes: 1 } }];
      this.model.campaignParticipationResult.isShared = true;
      this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
    });

    test('it should display modal before show assessment result', async function (assert) {
      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      assert.ok(
        screen.getByRole('dialog', { name: t('pages.skill-review.tabs.trainings.shared-results-modal.title') }),
      );
    });

    test('it should display the training button', async function (assert) {
      // when
      this.model.showTrainings = false;

      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      // then
      assert.notOk(
        screen.queryByRole('dialog', { name: t('pages.skill-review.tabs.trainings.shared-results-modal.title') }),
      );
      assert.dom(screen.getByRole('button', { name: t('pages.skill-review.hero.see-trainings') })).isVisible();
    });

    test('when the training button is clicked, it should set trainings tab active', async function (assert) {
      this.model.showTrainings = false;

      // when
      screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

      // then
      await click(screen.getByRole('button', { name: t('pages.skill-review.hero.see-trainings') }));
      assert
        .dom(screen.getByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }))
        .hasAttribute('aria-selected', 'true');
    });
    module('when the campaign is part of a combined course', function (hooks) {
      hooks.afterEach(async function () {
        this.model.showTrainings = true;
        this.model.campaign.customResultPageButtonUrl = undefined;
      });
      test('it should not display modal before show assessment result', async function (assert) {
        this.model.showTrainings = false;
        this.model.campaign.customResultPageButtonUrl = 'https://app.pix.fr/parcours/COMBINIX1';
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        assert.notOk(
          screen.queryByRole('dialog', { name: t('pages.skill-review.tabs.trainings.shared-results-modal.title') }),
        );
      });
      test('it should not display trainings tab', async function (assert) {
        this.model.showTrainings = false;
        this.model.campaign.customResultPageButtonUrl = 'https://app.pix.fr/parcours/COMBINIX1';
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        assert.notOk(screen.queryByRole('tab', { name: t('pages.skill-review.tabs.trainings.tab-label') }));
      });
      test('it should not display trainings information and button in the hero', async function (assert) {
        this.model.showTrainings = false;
        this.model.campaign.customResultPageButtonUrl = 'https://app.pix.fr/parcours/COMBINIX1';
        screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
        assert.notOk(screen.queryByText(t('pages.skill-review.hero.explanations.trainings')));
        assert.notOk(screen.queryByRole('button', { name: t('pages.skill-review.hero.see-trainings') }));
      });
    });
  });

  module('when the campaign has not been shared yet and has trainings', function () {
    module('when clicking on the share results button in the "formations" tab', function () {
      test('it should display the evaluation-sent-results modal with first 3 trainings', async function (assert) {
        // given
        this.model.trainings = generateTrainings(4);
        this.model.campaignParticipationResult.isShared = false;
        this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
        this.model.campaign.isForAbsoluteNovice = false;

        const store = this.owner.lookup('service:store');
        sinon.stub(store, 'adapterFor');
        const shareStub = sinon.stub();
        store.adapterFor.returns({ share: shareStub });

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
    });
    module('when clicking on the share results button in hero', function () {
      test('it should display the evaluation-sent-results modal with first 3 trainings', async function (assert) {
        // given
        stubCurrentUserService(this.owner, { id: '1234' });
        this.model.trainings = generateTrainings(4);
        this.model.campaignParticipationResult.isShared = false;
        this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
        this.model.campaign.isForAbsoluteNovice = false;

        const store = this.owner.lookup('service:store');
        sinon.stub(store, 'adapterFor');
        const shareStub = sinon.stub();
        store.adapterFor.returns({ share: shareStub });

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
        'https://assets.pix.org/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
    };
    results.push(training);
  }

  return results;
}
