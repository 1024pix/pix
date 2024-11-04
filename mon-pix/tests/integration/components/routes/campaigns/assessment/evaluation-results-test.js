import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

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

    // when
    screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
  });

  test('it should display a header', async function (assert) {
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
      this.model.trainings = [Symbol('training')];

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
});
