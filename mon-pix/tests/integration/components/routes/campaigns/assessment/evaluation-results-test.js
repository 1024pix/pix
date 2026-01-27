import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import { stubConfigService } from '../../../../../helpers/service-stubs.js';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

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

  module('when the has trainings', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      this.model.showTrainings = true;
      this.model.trainings = [{ duration: { days: 1, hours: 1, minutes: 1 } }];
      this.model.campaignParticipationResult.competenceResults = [Symbol('competences')];
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
});
