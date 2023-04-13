import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/trainings | list-items', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('noop', () => {});
  });

  test('it should display header with id and title', async function (assert) {
    // given
    const featureToggles = this.owner.lookup('service:feature-toggles');
    featureToggles.featureToggles = {
      isTrainingRecommendationEnabled: true,
    };

    // when
    const screen = await render(hbs`<Trainings::ListSummaryItems @triggerFiltering={{this.noop}} />`);

    // then
    assert.dom(screen.getByText('ID')).exists();
    assert.dom(screen.getByText('Titre')).exists();
  });

  test('it should display trainings summaries list', async function (assert) {
    // given
    const featureToggles = this.owner.lookup('service:feature-toggles');
    featureToggles.featureToggles = {
      isTrainingRecommendationEnabled: true,
    };
    const summaries = [
      { id: 1, title: "Apprendre en s'amusant" },
      { id: 2, title: 'Speed training' },
    ];
    summaries.meta = {
      pagination: { rowCount: 2 },
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<Trainings::ListSummaryItems @summaries={{this.summaries}} @triggerFiltering={{this.noop}} />`
    );

    // then
    assert.strictEqual(screen.getAllByLabelText('Contenu formatif').length, 2);
  });

  test('it should display trainings summaries data', async function (assert) {
    // given
    const featureToggles = this.owner.lookup('service:feature-toggles');
    featureToggles.featureToggles = {
      isTrainingRecommendationEnabled: true,
    };
    const summaries = [{ id: 123, title: 'Comment toiletter son chien' }];
    summaries.meta = {
      pagination: { rowCount: 2 },
    };
    this.summaries = summaries;

    // when
    const screen = await render(
      hbs`<Trainings::ListSummaryItems @summaries={{this.summaries}} @triggerFiltering={{this.noop}} />`
    );

    // then
    assert.dom(screen.getByLabelText('Contenu formatif')).containsText(123);
    assert.dom(screen.getByLabelText('Contenu formatif')).containsText('Comment toiletter son chien');
  });
});
